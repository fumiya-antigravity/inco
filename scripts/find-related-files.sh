#!/bin/bash

# 関連ファイル検索スクリプト
# 使用方法: ./scripts/find-related-files.sh <ComponentName>

if [ -z "$1" ]; then
    echo "使用方法: ./scripts/find-related-files.sh <ComponentName>"
    echo "例: ./scripts/find-related-files.sh ListView"
    exit 1
fi

COMPONENT=$1
APP_DIR="app/src"

echo "========================================="
echo "関連ファイル検索: $COMPONENT"
echo "========================================="

echo ""
echo "## アプローチ1: import/export"
echo "---"
grep -rn "import.*$COMPONENT" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null || echo "見つかりませんでした"

echo ""
echo "## アプローチ2: 使用箇所"
echo "---"
grep -rn "$COMPONENT" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null | head -20 || echo "見つかりませんでした"

echo ""
echo "## アプローチ3: テストファイル"
echo "---"
find $APP_DIR -name "*$COMPONENT*.test.jsx" -o -name "*$COMPONENT*.test.tsx" 2>/dev/null || echo "見つかりませんでした"

echo ""
echo "## アプローチ4: 仕様書"
echo "---"
grep -rn "$COMPONENT" docs 2>/dev/null || echo "見つかりませんでした"

echo ""
echo "## アプローチ5: ファイル名パターン"
echo "---"
find $APP_DIR -name "*$COMPONENT*" 2>/dev/null || echo "見つかりませんでした"

echo ""
echo "========================================="
echo "検索完了"
echo "========================================="
