#!/bin/bash

# 問題検出スクリプト
# 使用方法: ./scripts/detect-issues.sh

APP_DIR="app/src"

echo "========================================="
echo "問題検出スクリプト"
echo "========================================="

echo ""
echo "## 1. stopPropagationの使用箇所"
echo "---"
STOP_PROP_COUNT=$(grep -rn "stopPropagation" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "検出数: $STOP_PROP_COUNT 箇所"
if [ "$STOP_PROP_COUNT" -gt 0 ]; then
    echo ""
    echo "詳細:"
    grep -rn "stopPropagation" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null | head -10
    if [ "$STOP_PROP_COUNT" -gt 10 ]; then
        echo "... (残り $((STOP_PROP_COUNT - 10)) 箇所)"
    fi
fi

echo ""
echo "## 2. dark:クラスの残存"
echo "---"
DARK_CLASS_COUNT=$(grep -rn "dark:" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "検出数: $DARK_CLASS_COUNT 箇所"
if [ "$DARK_CLASS_COUNT" -gt 0 ]; then
    echo ""
    echo "ファイルごとの件数:"
    grep -rn "dark:" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null | cut -d: -f1 | sort | uniq -c | sort -rn | head -10
fi

echo ""
echo "## 3. console.logの残存"
echo "---"
CONSOLE_LOG_COUNT=$(grep -rn "console.log" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "検出数: $CONSOLE_LOG_COUNT 箇所"
if [ "$CONSOLE_LOG_COUNT" -gt 0 ]; then
    echo ""
    echo "詳細:"
    grep -rn "console.log" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null | head -5
fi

echo ""
echo "## 4. TODOコメント"
echo "---"
TODO_COUNT=$(grep -rn "TODO" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "検出数: $TODO_COUNT 箇所"
if [ "$TODO_COUNT" -gt 0 ]; then
    echo ""
    echo "詳細:"
    grep -rn "TODO" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null | head -5
fi

echo ""
echo "## 5. FIXMEコメント"
echo "---"
FIXME_COUNT=$(grep -rn "FIXME" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "検出数: $FIXME_COUNT 箇所"
if [ "$FIXME_COUNT" -gt 0 ]; then
    echo ""
    echo "詳細:"
    grep -rn "FIXME" $APP_DIR --include="*.jsx" --include="*.tsx" 2>/dev/null
fi

echo ""
echo "## 6. 未使用のimport (簡易チェック)"
echo "---"
echo "※ ESLintで詳細確認を推奨"
# npm run lint 2>/dev/null | grep "is defined but never used" | head -5 || echo "ESLintが設定されていません"

echo ""
echo "========================================="
echo "検出完了"
echo "========================================="

echo ""
echo "## サマリー"
echo "---"
echo "stopPropagation: $STOP_PROP_COUNT 箇所"
echo "dark:クラス: $DARK_CLASS_COUNT 箇所"
echo "console.log: $CONSOLE_LOG_COUNT 箇所"
echo "TODO: $TODO_COUNT 箇所"
echo "FIXME: $FIXME_COUNT 箇所"

TOTAL_ISSUES=$((STOP_PROP_COUNT + DARK_CLASS_COUNT + CONSOLE_LOG_COUNT + TODO_COUNT + FIXME_COUNT))
echo ""
echo "合計: $TOTAL_ISSUES 箇所の潜在的な問題を検出"
