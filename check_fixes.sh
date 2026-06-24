#!/bin/bash
echo "🔍 Verificando integridade das correções..."

ERRORS=0

check() {
  COUNT=$(grep -c "$2" "$1" 2>/dev/null || echo "0")
  if [ "$COUNT" -eq "0" ]; then
    echo "❌ PERDIDO: $2 em $1"
    ERRORS=$((ERRORS+1))
  else
    echo "✅ OK: $1"
  fi
}

check "src/App.tsx" "unreadMessagesCount"
check "src/App.tsx" "fetchUnreadCount"
check "src/components/Sidebar.tsx" "createPortal"
check "src/components/Sidebar.tsx" "showInbox"
check "src/components/Sidebar.tsx" "Bell"
check "src/components/AcademiesCommunities.tsx" "jiuspeak_access_token"
check "src/components/dashboard/MissionCard.tsx" "100 XP"
check "server/academyRouter.ts" "router.post.*sync"

# Verificar duplicatas no App.tsx
DUPES=$(grep -c "const \[unreadMessagesCount" src/App.tsx)
if [ "$DUPES" -gt "1" ]; then
  echo "❌ DUPLICATA: unreadMessagesCount declarado $DUPES vezes em App.tsx"
  ERRORS=$((ERRORS+1))
fi

echo ""
if [ "$ERRORS" -eq "0" ]; then
  echo "✅ Tudo OK! Pode fazer o build com segurança."
else
  echo "⚠️  $ERRORS problema(s) encontrado(s). NÃO faça o build antes de corrigir."
fi
