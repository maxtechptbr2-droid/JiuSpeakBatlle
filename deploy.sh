#!/bin/bash
echo "🔍 Verificando integridade antes do build..."

ERRORS=0

check() {
  COUNT=$(grep -c "$2" "$1" 2>/dev/null || echo "0")
  if [ "$COUNT" -eq "0" ]; then
    echo "❌ PERDIDO em $1: $2"
    echo "   Restaurando backup..."
    BASENAME=$(basename "$1")
    if [ -f ".backups/$BASENAME" ]; then
      cp ".backups/$BASENAME" "$1"
      echo "   ✅ Restaurado de .backups/$BASENAME"
    else
      echo "   ⚠️  Sem backup disponível"
    fi
    ERRORS=$((ERRORS+1))
  else
    echo "✅ OK: $1"
  fi
}

check "src/App.tsx" "unreadMessagesCount"
check "src/App.tsx" "fetchUnreadCount"
check "src/components/Sidebar.tsx" "createPortal"
check "src/components/Sidebar.tsx" "showInbox"
check "src/components/AcademiesCommunities.tsx" "jiuspeak_access_token"
check "server/academyRouter.ts" "sync-status"

# Verificar duplicatas
DUPES=$(grep -c "const \[unreadMessagesCount" src/App.tsx)
if [ "$DUPES" -gt "1" ]; then
  echo "❌ DUPLICATA no App.tsx — restaurando backup..."
  cp .backups/App.tsx src/App.tsx
  ERRORS=$((ERRORS+1))
fi

echo ""
if [ "$ERRORS" -gt "0" ]; then
  echo "⚠️  $ERRORS problema(s) corrigido(s) automaticamente."
  echo "   Verifique os arquivos antes de continuar."
fi

echo "🚀 Iniciando build..."
npm run build && pm2 restart jiuspeak && echo "✅ Deploy concluído!"
