#!/usr/bin/env bash
# Test rapide de tous les endpoints MSPR501
# Usage : bash test-endpoints.sh

set -u
KEY="dev-healthai-key"
IA="http://localhost:8000"
HONO="http://localhost:3002"
PASS=0
FAIL=0

check() {
    local label="$1"
    local url="$2"
    local expected="${3:-200}"
    local headers="${4:-}"
    local code
    if [ -n "$headers" ]; then
        code=$(curl -s -o /dev/null -w "%{http_code}" -H "$headers" "$url")
    else
        code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    fi
    if [ "$code" = "$expected" ]; then
        echo "✓ $label → $code"
        PASS=$((PASS + 1))
    else
        echo "✗ $label → $code (expected $expected)"
        FAIL=$((FAIL + 1))
    fi
}

echo "=== Health checks ==="
check "ia-python /health" "$IA/health"
check "backend-hono /" "$HONO/"
check "postgres (via ia-python)" "$IA/health" 200

echo ""
echo "=== ia-python OpenAPI ==="
check "Swagger UI" "$IA/docs"
check "OpenAPI JSON" "$IA/openapi.json"

echo ""
echo "=== Admin endpoints (X-API-Key required) ==="
check "data-quality" "$IA/api/v1/admin/data-quality" 200 "X-API-Key: $KEY"
check "runs" "$IA/api/v1/admin/runs?limit=10" 200 "X-API-Key: $KEY"
check "rejected-rows" "$IA/api/v1/admin/rejected-rows" 200 "X-API-Key: $KEY"
check "validation PENDING" "$IA/api/v1/admin/validation?status=PENDING" 200 "X-API-Key: $KEY"
check "validation all" "$IA/api/v1/admin/validation" 200 "X-API-Key: $KEY"
check "datasets/exercisedb" "$IA/api/v1/admin/datasets/exercisedb" 200 "X-API-Key: $KEY"
check "datasets/unknown (404)" "$IA/api/v1/admin/datasets/foobar" 404 "X-API-Key: $KEY"
check "export JSON" "$IA/api/v1/admin/export/daily_food_nutrition?format=json" 200 "X-API-Key: $KEY"
check "export CSV" "$IA/api/v1/admin/export/daily_food_nutrition?format=csv" 200 "X-API-Key: $KEY"
check "analytics demographics" "$IA/api/v1/admin/analytics/demographics" 200 "X-API-Key: $KEY"
check "analytics nutrition-trends" "$IA/api/v1/admin/analytics/nutrition-trends?days=7" 200 "X-API-Key: $KEY"
check "analytics fitness-stats" "$IA/api/v1/admin/analytics/fitness-stats?limit=5" 200 "X-API-Key: $KEY"
check "analytics business-kpis" "$IA/api/v1/admin/analytics/business-kpis" 200 "X-API-Key: $KEY"

echo ""
echo "=== Sécurité (sans clé) ==="
check "admin sans clé → 401" "$IA/api/v1/admin/data-quality" 401

echo ""
echo "=== backend-hono proxy (sans session → 401) ==="
check "hono admin → 401" "$HONO/api/admin/data-quality" 401

echo ""
echo "=== Données SQL vérifiées ==="
curl -s -H "X-API-Key: $KEY" "$IA/api/v1/admin/data-quality" | head -c 500 | python3 -m json.tool 2>/dev/null || curl -s -H "X-API-Key: $KEY" "$IA/api/v1/admin/data-quality" | head -c 500

echo ""
echo ""
echo "============================================"
echo "  $PASS passés, $FAIL échoués"
echo "============================================"
[ "$FAIL" -eq 0 ]
