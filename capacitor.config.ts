import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jiuspeak.app',
  appName: 'JiuSpeak',
  webDir: 'dist',
  server: {
    // Em desenvolvimento, aponta pro servidor remoto (descomentar):
    // url: 'https://jiuspeak.com.br',
    // Em produção (build local com assets embarcados), manter comentado.
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      // Mesmo fundo escuro do site (theme-color/PWA)
      backgroundColor: '#070c1b',
      showSpinner: false,
    },
    StatusBar: {
      // DARK = ícones/texto claros sobre fundo escuro
      style: 'DARK',
      backgroundColor: '#070c1b',
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
