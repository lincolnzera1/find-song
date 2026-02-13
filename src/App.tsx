import { Box, Input, Text, Container, VStack, Card, CardBody, Heading, Badge, Button, Alert, AlertIcon, Flex } from "@chakra-ui/react";
import { useState, useEffect } from "react";

// Interface para o prompt de instalação PWA
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Interface para navigator com standalone
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

const App = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    // Inicializar no estado inicial para evitar setState em useEffect
    return globalThis.matchMedia('(display-mode: standalone)').matches ||
           (globalThis.navigator as NavigatorWithStandalone).standalone ||
           document.referrer.includes('android-app://');
  });

  useEffect(() => {
    // Detectar mudanças de conectividade
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);

    // Detectar quando o PWA pode ser instalado
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('Event beforeinstallprompt disparado');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listener para Windows/Android 
    globalThis.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Para iOS Safari - detectar se pode ser salvo (usando timeout para evitar setState síncrono)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (globalThis.navigator as NavigatorWithStandalone).standalone;
    
    if (isIOS && !isInStandaloneMode) {
      console.log('iOS detectado - mostrando opção de instalação');
      setTimeout(() => setShowInstallPrompt(true), 0);
    }

    // Detectar mudanças no status de instalação
    const mediaQuery = globalThis.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches || 
                    (globalThis.navigator as NavigatorWithStandalone).standalone ||
                    document.referrer.includes('android-app://'));
    };
    
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registrado com sucesso:', registration);
        })
        .catch((error) => {
          console.error('SW falha no registro:', error);
        });
    }
    
    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
      globalThis.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('Botão instalar clicado');
    
    if (deferredPrompt) {
      console.log('Usando deferredPrompt');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Resultado:', outcome);
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
      // Instruções específicas por plataforma
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isChrome = /Chrome/.test(navigator.userAgent);
      const isEdge = /Edg/.test(navigator.userAgent);
      
      let instructions = '';
      
      if (isIOS) {
        instructions = 'Para instalar no iOS:\n\n1. Toque no botão "Compartilhar" (📤)\n2. Role para baixo e toque em "Adicionar à Tela de Início"\n3. Toque em "Adicionar"';
      } else if (isChrome) {
        instructions = 'Para instalar no Chrome:\n\n1. Clique nos 3 pontos (⋮) no canto superior direito\n2. Clique em "Instalar aplicativo"\n3. Clique em "Instalar"';
      } else if (isEdge) {
        instructions = 'Para instalar no Edge:\n\n1. Clique nos 3 pontos (...) no canto superior direito\n2. Clique em "Aplicativos" → "Instalar este site como aplicativo"\n3. Clique em "Instalar"';
      } else {
        instructions = 'Para instalar:\n\n• Chrome/Edge: Menu (⋮) → "Instalar aplicativo"\n• Firefox: Menu → "Instalar"\n• Mobile: Menu do navegador → "Adicionar à tela inicial"';
      }
      
      alert(instructions);
    }
  };

  const musicas = [
    {
      title: "Autoridade e poder marcos góes",
      song: "Os que confiam no Senhor\nSão como os montes de Sião\nQue não se abalam\nMas permanecem para sempre\n\nComo em volta de Jerusalém\nEstão os montes\nAssim é o Senhor em volta do seu povo\n\nAutoridade e poder\nO domínio em suas mãos\nPois o Senhor é Deus\nO Senhor é Rei dos Povos\n\nCale-se diante dele a terra\nDobre os joelhos, ergam as mãos\nPois o Senhor é Deus\nO Senhor é Rei dos Povos\n\nOs que confiam no Senhor\nSão como os montes de Sião\nQue não se abalam\nMas permanecem para sempre\n\nComo em volta de Jerusalém\nEstão os montes\nAssim é o Senhor em volta do seu povo\n\nAutoridade e poder\nO domínio em suas mãos\nPois o Senhor é Deus\nO Senhor é Rei dos Povos\n\nCale-se diante dele a Terra\nDobre os joelhos, ergam as mãos\nPois o Senhor é Deus\nO Senhor é Rei dos Povos\n\nAutoridade e poder\nO domínio em suas mãos\nPois o Senhor é Deus\nO Senhor é Rei dos Povos\n\nCale-se diante dele a terra\nDobre os joelhos, ergam as mãos\nPois o Senhor é Deus\nO Senhor é Rei dos Povos",
    },
    {
      title: "Eu Vou Seguir com Fé",
      song: "O meu Deus é maior que os meus problemas\nEu não temerei\nCom Jesus eu vou além\nAinda que a figueira não floresça\nE que não haja fruto na videira\nEu não temerei, não, não!\n\nPois sei que para além das nuvens\nO Sol não deixou de brilhar\nSó por que a terra escureceu\nOh\nA minha vida está em Deus\nEu sei que tudo posso em Deus\nÉ ele quem me fortalece!\nHey\n\nEu vou seguir com fé\nCom meu Deus, eu vou\nPara a rocha mais alta que eu\nEu sei pra onde vou\nComo águia vou\nNas alturas sou filho de Deus\n\nOh\nHey\nParaparapa\nUh\n\nO meu Deus sabe tudo que eu preciso\nPra sentir a paz dentro do meu coração\nAinda que a Lua adormeça\nE não haja o brilho nas estrelas\nEu não temerei não, não!\n\nPois sei que para além das nuvens\nO Sol não deixou de brilhar\nSó por que a terra escureceu\nHey\nA minha vida está em Deus\nUh\nEu sei que tudo posso em Deus\nÉ ele quem me fortalece!\nVai\n\nEu vou seguir com fé\nCom meu Deus, eu vou\nPara a rocha mais alta que eu\nEu sei pra onde vou\nComo águia eu vou\nNas alturas sou filho de Deus\nEu vou seguir com fé\nCom meu Deus, eu vou\nPara a rocha mais alta que eu\nEu sei pra onde vou\nComo águia vou\nNas alturas, sou\nJoga essa mão pra cima e bate palma\n\nUh\nHey\nOh\nOh\nUh\nHey\n\nEu vou seguir com fé\n(Com meu Deus, eu vou)\nPara a rocha mais alta que eu\nEu sei pra onde vou\nComo águia eu vou\nNas alturas sou filho de Deus\nEu vou seguir com fé\nCom meu Deus, eu vou\nPara a rocha mais alta que eu\nEu sei pra onde vou\nComo águia eu vou\nNas alturas sou filho de Deus\n\nSó quem é filho de Deus dá um grito\nYeah uh",
    },
    {
      title: "Teste",
      song: `Vem o temporal
Vem o dia mal
Mas Deus me faz assim
Pés sobre a rocha, ele cuida bem de mim
Guarda a minha saída
Guarda a minha entrada
Ele é minha sombra
Mão direita que não falha
Durante o dia o sol não pode me ferir
Com ele à noite eu posso até sorrir
Estou olhando para os montes
Meu socorro vem de Deus
Não paro de olhar pros montes
Ele não descansa, ele é o guarda de Israel
Rei da terra e é também dono do céu
Vem o temporal
Vem o dia mal
Mas Deus me faz assim
Pés sobre a rocha, ele cuida bem de mim
Guarda a minha saída
Guarda a minha entrada
Ele é minha sombra
Mão direita que não falha
Durante o dia o sol não pode me ferir
Com ele à noite eu posso até sorrir
Estou olhando para os montes
Meu socorro vem de Deus
Não paro de olhar pros montes
Ele não descansa, ele é o guarda de Israel
Rei da terra e é também dono do céu
Eu confio nele
Estou olhando para os montes
Meu socorro vem de Deus
Não paro de olhar pros montes
Ele não descansa, ele é o guarda de Israel
Rei da terra e é também dono do céu
Meu lugar seguro, minha proteção
Todo poderoso, Deus da minha salvação
Ôh ôh, ôh ôh, ôh ôh, ôh ôh
Ôh ôh, ôh ôh, ôh uh ôh, ôh ôh
Estou olhando para os montes
Meu socorro vem de Deus
Não paro de olhar pros montes
Ele não descansa, ele é o guarda de Israel
Rei da terra e é também dono do céu`,
    },
    {
      title: "GABRIELA ROCHA - MEU RESPIRAR / MEU PRAZER (AO VIVO)",
      song: `
        Este é o meu respirar
Este é o meu respirar
Teu santo espírito
Vivendo em mim
E este é o meu pão
E este é o meu pão
Tua vontade feita em mim (diga)
E eu (oh)
Eu nada sou sem ti (não, não, não, não)
E eu
Perdido estou sem ti (eu nada sou, não, não)
E eu
Eu nada sou sem ti, Jesus (não, eu nada sou)
E eu
Perdido estou sem ti
Rei dos reis e senhor
Te entregamos nosso viver
Oh, rei dos reis e senhor
Te entregamos nosso (erga sua voz, diga)
Pra te adorar, oh, Rei dos Reis
Foi que eu nasci, oh, Rei Jesus
Meu prazer é te louvar
Meu prazer é estar (oh)
Nos átrios do senhor
Meu prazer é viver (na casa de Deus)
Oh, o meu prazer está em ti, Deus
O meu prazer está
Pra te adorar, oh, Rei dos Reis
Foi que eu nasci, oh (Rei Jesus)
O meu prazer é te louvar
Meu prazer é estar
Nos átrios do senhor
Meu prazer é viver na casa de Deus
Onde flui o amor, ooh
E eu
Eu nada sou (sem ti)
E eu
Perdido (estou sem ti), ooh
E eu
Eu nada sou sem ti, eu nada tenho, nada possuo
E eu
Perdido estou sem ti
      `,
    },
    {
      title: "GABRIELA ROCHA - MEU RESPIRAR / MEU PRAZER (AO VIVO)",
      song: `
      Porque Dele e por Ele
Para Ele são todas as coisas
Porque Dele e por Ele
Para Ele são todas as coisas
Porque Dele e por Ele
Para Ele são todas as coisas
Porque Dele e por Ele
Para Ele são todas as coisas
A Ele a Glória
A Ele a Glória
A Ele a Glória
Pra sempre, amém
A Ele a Glória
A Ele a Glória
A Ele a Glória
Pra sempre, amém
Quão profundas riquezas
O saber e o conhecer de Deus
Quão insondáveis
Seus juízos e os Seus caminhos
Quão profundas riquezas
O saber e o conhecer de Deus
Quão insondáveis
Seus juízos e os Seus caminhos
Digamos
A Ele a Glória
A Ele a Glória
A Ele a Glória
Pra sempre, e sempre, e sempre
Digamos
A Ele a Glória
A Ele a Glória
A Ele a Glória
Pra sempre, pra sempre
Aquele que é, Aquele que é
Aquele que aquela noite tinha de ser
Rei da Glória
Rei da Glória
Te entregamos tudo
Te damos tudo, Te damos tudo
Para sempre, e sempre, e sempre, e sempre, e sempre
Te amo
A Ele a Glória
A Ele a Glória
A Ele a Glória
Pra sempre
E não há outro, e não há outro além de Ti
E não há outro além de Ti
Rei da Glória, diga
A Ele a, sincronizamos, sincronizamos, Santo, Santo, Santo)
A Ele a
Pra sempre, amém
A Ele a Glória
A Ele a Glória
A Ele a Glória
A Ele a Glória
A Ele a glória
Pra sempre
Nunca se viu e nunca se ouviu
Falar de um Deus como Tu
És invencível
A Ele a Glória
A Ele a Glória (A Ele a Glória)
A Ele a Glória (pra sempre, sempre)`,
    },
    {
      title: "A casa é sua",
      song: `
        Você é bem-vindo, aqui
A casa é sua, pode entrar
Me esvazio de mim
Me esvazio de mim
Sopra o teu vento aqui
Toma o teu trono vem reinar
Nós queremos te ouvir
Nós queremos te ouvir
Essa casa é sua casa
Nós deixamos ela pra você, Jesus
Essa casa é sua casa
Nós deixamos ela pra você, Jesus (essa casa)
Essa casa é sua casa
Nós deixamos ela pra você, Jesus (essa casa)
Essa casa é sua casa
Nós deixamos ela pra você, Jesus
Apareça, que o teu nome cresça
Enche este lugar
Enche este lugar
Apareça, que o teu nome cresça
Vem me incendiar
Vem me incendiar
Apareça, que o teu nome cresça
Enche este lugar
Enche este lugar
Apareça, que o teu nome cresça
Vem me incendiar
Vem me incendiar
Essa casa é sua casa
Nós deixamos ela pra você, Jesus
Essa casa é sua casa
Nós deixamos ela pra você, Jesus (oh, se você é habitação dele, declare isso)
Essa casa é sua casa
Nós deixamos ela pra você, Jesus
Essa casa é sua casa
Nós deixamos ela pra você, Jesus
Apareça, que o teu nome cresça
Enche este lugar
Enche este lugar
Apareça, que o teu nome cresça
Vem me incendiar
Vem me incendiar
Apareça, que o teu nome cresça
Enche este lugar
Enche este lugar, oh Deus
Apareça, que o teu nome cresça
Vem me incendiar
Vem me incendiar
Essa casa é sua casa
Nós deixamos ela pra você, Jesus
Nós deixamos Jesus, nós deixamos Jesus
Nós deixamos ela pra você, Jesus
Tu és o morador, Jesus, tu és o morador
Tu és o morador, Jesus, tu és o morador, Jesus
Tu és o morador, Jesus
Vem Jesus, vem Jesus, pode entrar
Pode entrar, Jesus
Mude todas coisas de lugar, Jesus
Mude tudo de lugar, Jesus
No lugar da teia de aranha do pecado
Eu trago flores, flores que trazem vida, vida
Pra essa casa
E ao invés de esconder debaixo do tapete o seu passado
Eu tiro a sujeira, jogo no lixo e deixo limpo
Purifico a casa onde eu pretendo habitar
Onde eu prenendo habitar
Onde eu pretendo habitar
Se você é essa casa, erga as suas mãos ao céus
E diga: Essa casa
Essa casa é sua casa
Nós deixamos ela pra você, Jesus (Jesus, essa casa)
Essa casa é sua casa
Nós deixamos ela pra você, Jesus (vem, enche essa casa, enche Jesus)
(Essa casa, diga)
Essa casa é sua casa
Nós deixamos ela pra você, Jesus (enche esse lugar, essa casa, essa casa)
Essa casa é sua casa
Nós deixamos ela pra você, Jesus
Apareça, que o teu nome cresça
Enche este lugar
Enche este lugar
Apareça, que o teu nome cresça
Vem me incendiar
Vem me incendiar, oh apareça
Apareça, que o teu nome cresça
(Enche este lugar) enche Deus
(Enche este lugar) apareça
Apareça, que o teu nome cresça
Vem me incendiar
Vem me incendiar (essa casa)
Essa casa é sua casa
Nós deixamos ela pra você
      `,
    },
    {
      title: "O nosso general é cristo",
      song: `
        Pelo Senhor, marchamos sim
O seu exército, poderoso é
Sua glória será vista em toda terra

Vamos cantar o canto da vitória
Glória à Deus, vencemos a batalha
Toda arma contra nós perecerá

O nosso general é Cristo
Seguimos os seus passos
Nenhum inimigo nos resistirá

O nosso general é Cristo
Seguimos os seus passos
Nenhum inimigo nos resistirá

Pelo senhor, marchamos sim
O seu exercito, poderoso é
Sua glória sera vista em toda terra

Vamos cantar o canto da vitória
Glória à Deus, vencemos a batalha
Toda arma contra nós perecerá

O nosso general é Cristo
Seguimos os seus passos
Nenhum inimigo nos resistirá

O nosso general é Cristo
Seguimos os seus passos
Nenhum inimigo nos resistirá

Nenhum inimigo nos resistirá
Nenhum inimigo nos resistirá
      `,
    },
    {
      title: "Bondade de Deus",
      song: `
      Te amo, Deus, tua graça nunca falha
Todos os dias eu estou em tuas mãos
Desde quando me levanto até eu me deitar
Eu cantarei da bondade de Deus
És fiel em todo tempo
Em todo tempo tu és tão, tão bom
Com todo fôlego que tenho
Eu cantarei da bondade de Deus
Tua doce voz que me guia em meio ao fogo
Na escuridão, tua presença me conforta
Eu sei que és meu pai, que amigo és
E eu vivo na bondade de Deus
És fiel em todo tempo
Em todo tempo tu és tão, tão bom
Com todo fôlego que tenho
Eu cantarei da bondade de Deus
Tu és fiel, Jesus, tu és fiel
És fiel em todo tempo
Em todo tempo tu és tão, tão bom
Com todo fôlego que tenho
Eu cantarei da bondade de Deus
Tua bondade, senhor
Nos seguirá todos os dias das nossas vidas
Tua bondade me seguirá
Me seguirá, senhor
Tua bondade me seguirá
Me seguirá, senhor
Eu me rendo a ti, te dou meu ser
Entrego tudo a ti
Tua bondade me seguirá
Me seguirá, senhor
Tua bondade me seguirá
Me seguirá, senhor
Tua bondade me seguirá
Me seguirá, senhor
Eu me rendo a ti, te dou meu ser
Entrego tudo a ti
Tua bondade me seguirá
Me seguirá, senhor
Tu és fiel, tu és tão bom, meu Deus
És fiel em todo tempo
Em todo tempo tu és tão, tão bom
Com todo fôlego que tenho
Eu cantarei da bondade de Deus
Então cante que ele é fiel
És fiel em todo tempo
Em todo tempo tu és tão, tão bom
Com todo fôlego que tenho
Eu cantarei da bondade de Deus
És fiel em todo tempo
Em todo tempo tu és tão, tão bom
Com todo fôlego que tenho, que tenho, que tenho
Eu cantarei da bondade de Deus
Então cante isso com todo o seu coração, ele é fiel
És fiel em todo tempo
Em todo tempo tu és tão, tão bom
Com todo fôlego que tenho
Eu cantarei da bondade de Deus`,
    },
    {
      title: "Vou te alegrar",
      song: `
      Quantos querem se alegrar?
Vamos alegrar o Senhor nessa noite
Eu me rendo a Ti perante os homens, perante tudo
Quero que o Universo seja a minha testemunha
Vou erguer perante o Teu trono minha adoração
E levar com ela toda minha gratidão
Senhor, és o motivo da minha alegria
Deus meu, és o caminho distante do mundo
Vou Te alegrar com o meu louvor
Eu quero Te tocar com o meu amor
Poder Te abraçar, sentir o Teu pulsar
Teu coração bater ao meu
Vou Te alegrar com o meu louvor
Eu quero Te tocar com o meu amor
Poder Te abraçar, sentir o Teu pulsar
Teu coração bater ao meu
Eu me rendo a Ti perante os homens, perante tudo
Quero que o Universo seja a minha testemunha
Vou erguer perante o Teu trono minha adoração
E levar com ela toda minha gratidão
Senhor, és o motivo da minha alegria
Deus meu, és o caminho distante do mundo
Vou Te alegrar com o meu louvor
Eu quero Te tocar com o meu amor
Poder Te abraçar, sentir o Teu pulsar
Teu coração bater ao meu
Vou Te alegrar com o meu louvor
Eu quero Te tocar com o meu amor
Poder Te abraçar, sentir o Teu pulsar
Teu coração bater ao meu
Te amo
Te adoro
Me prostro
Pra Te adorar, Te alegrar
Te amo
Te adoro
Me prostro
Só pra Te adorar, Te alegrar
Vou Te alegrar com o meu louvor
Eu quero Te tocar com o meu amor
Poder Te abraçar, sentir o Teu pulsar
Teu coração bater ao meu
Vou Te alegrar com o meu louvor
Eu quero Te tocar com o meu amor
Poder Te abraçar, sentir o Teu pulsar
Teu coração bater ao meu
Eu Te amo
Se você ama o Senhor
Dê uma forte salva de palmas a Ele
      `,
    },
    {
      title: "gratidão",
      song: `Nada novo achei pra dizer então
Como expressar minha gratidão
Posso até cantar alguma canção
Que vai acabar, mas a sua não
Então vou levantar as minhas mãos e louvar
Pois tudo o que tenho é um aleluia, aleluia
Sei que é simples pra um rei
Mas não tenho nada além
De um coração cantando aleluia, aleluia
Em resposta a ti há uma ação
Me render aqui em adoração
Então vou levantar as minhas mãos e louvar
Pois tudo o que tenho é um aleluia, aleluia
Sei que é simples pra um rei
Mas não tenho nada além
De um coração cantando aleluia, aleluia
Ei, meu coração
Não se envergonhe, cante essa canção
Pois sei que há fôlego nesses pulmões
Vamos, louve ao senhor
Ei, meu coração
Não se envergonhe, cante essa canção
Pois sei que há fôlego nesses pulmões
Vamos, louve ao senhor
Ei, meu coração
Não se envergonhe, cante essa canção
Pois sei que há fôlego nesses pulmões
Vamos, louve ao senhor
Ô, ô
Uh, uh, uh, uh
Louve ao senhor
Com todo o seu coração
Louve ao senhor
Com todo o seu coração
Ah, ah, ah, ah, ah, ah, ah
Então vou levantar as minhas mãos e louvar
Pois tudo o que tenho é um aleluia, aleluia
Sei que é simples pra um rei
Mas não tenho nada além
De um coração cantando aleluia, aleluia`,
    },
    {
      title: "vitorioso és",
      song: `Lutamos com armas de fé
E nada irá resistir
Enquanto adoramos

Em meio às tribulações
O nosso Deus é vencedor
Nós O adoramos

Vitorioso és
Na tempestade estás
Teu nome infalível é
Os reinos vêm e vão
Teu trono acima está
Teu nome imutável é

O inferno não prevaleceu
E nada irá me impedir
Eu Te adorarei

Muralhas vão estremecer
Cadeias irão se romper
Enquanto adoramos

Vitorioso és
Na tempestade estás
Teu nome infalível é
Os reinos vêm e vão
Teu trono acima está
Teu nome imutável é

Como um trovão, impetuoso
Poderoso és, grandioso és
Que venha o céu, nós proclamamos
Poderoso és, grandioso

Como um trovão, impetuoso
Poderoso és, grandioso és
Que venha o céu, nós proclamamos
Poderoso és, grandioso és

Vitorioso és
Na tempestade estás
Teu nome infalível é
Os reinos vêm e vão
Teu trono acima está
Teu nome imutável

Como um trovão, impetuoso
Grandioso és
Que venha o céu, nós proclamamos

Vitorioso és
Na tempestade estás
Teu nome infalível é
Os reinos vêm e vão
Teu trono acima está
Teu nome imutável é

Vitorioso és
Na tempestade estás
Teu nome infalível é
Os reinos vêm e vão
Teu trono acima está
Teu nome imutável é`,
    },
    {
      title: "renascer",
      song: `A Ti eu vou clamar
Pois tudo vem de Ti
E tudo está em Ti
Por Ti vou caminhar
Tu és a direção
O Sol a me guiar

Tudo pode passar
Teu amor jamais me deixará
Sempre há de existir novo amanhã
Preparado pra mim
Preparado pra mim

(A Ti, Senhor)
A Ti eu vou clamar
Pois tudo vem de Ti
E tudo está em Ti
Por Ti vou caminhar
Tu és a direção
O Sol a me guiar

Tudo pode passar
Teu amor jamais me deixará
Sempre há de existir novo amanhã
Preparado pra mim
Preparado pra mim
Preparado pra mim

Eu me rendo aos Teus pés
És tudo que eu preciso pra viver
Eu me lanço aos Teus braços
Onde encontro meu refúgio

Eu me rendo aos Teus pés
És tudo que eu preciso pra viver
Eu me lanço aos Teus braços
Onde encontro meu refúgio

Jesus
Eis-me aqui
Jesus (Jesus, Jesus)
Eis-me aqui

Eu me rendo aos Teus pés
És tudo que eu preciso pra viver
Eu me lanço aos Teus braços
Onde encontro meu refúgio

Eu me rendo aos Teus pés
És tudo que eu preciso pra viver (preciso pra viver)
Eu me lanço aos Teus braços
Onde encontro meu refúgio

Jesus
Eis-me aqui (eis-me aqui, Senhor)
Jesus (eis-me aqui, eis-me aqui)
Eis-me aqui

Jesus
Eis-me aqui
Jesus
Eis-me aqui`,
    },
    {
      title: "Hosana",
      song: ` Eu vejo o Rei da glória
Vindo com o Seu poder
A terra vai estremecer
Eu vejo Sua graça
Os pecados perdoar
A terra vai então cantar
Hosana, (Hosana)
(Hosana nas alturas) Hosana
Hosana, Hosana
Hosana nas alturas
Eu vejo um povo eleito
Assumindo o Seu lugar
Pra Sua fé compartilhar
Eu vejo aqui e
Eu vejo o avivamento
Quando o teu povo orar
E te buscar
E te buscar
Hosana, Hosana
Hosana nas alturas
Hosana, Hosana
Hosana nas alturas
Adore ao Rei
Hosana
Limpa o meu coração
Abre os meus olhos pra que eu possa ver
Com o amor que tens por mim
Te amo
Diga a Ele, oh Deus
Eu quero ser igual a Ti
Tudo o que sou é pra o teu louvor
Pois contigo vou viver pra sempre
Hosana, (Hosana)
(Hosana nas alturas) Hosana
Hosana, Hosana
(Hosana nas alturas) levante as suas mãos bem alto
Declare: Hosana ao Rei
Hosana, Hosana
Hosana nas alturas
Hosana, Hosana
Hosana nas alturas
Hosana nas alturas
Nas alturas`,
    },
    {
      title: "Eu navegarei",
      song: `Eu navegarei
No oceano do Espírito
E ali adorarei
Ao Deus do meu amor

Eu adorarei
Ao Deus da minha vida
Que me compreendeu
Sem nenhuma explicação

Espírito, Espírito
Que desce como fogo
Vem como em Pentecostes
E enche-me de novo

Espírito, Espírito
Que desce como fogo
Vem como em Pentecostes
E enche-me de novo

Eu navegarei
No oceano do Espírito
E ali adorarei
Ao Deus do meu amor

Eu adorarei
Ao Deus da minha vida
Que me compreendeu
Sem nenhuma explicação

Espírito, Espírito
Que desce como fogo
Vem como em Pentecostes
E enche-me de novo

Espírito, Espírito
Que desce como fogo
Vem como em Pentecostes
E enche-me de novo`,
    },
    {
      title: "descansarei",
      song: `
      Cobre-me
Com Tuas mãos
Com poder
Vem me esconder, Senhor

Se o trovão e o mar se erguendo vêm
Sobre a tempestade eu voarei
Sobre as águas Tu também és Rei
Descansarei, pois sei que és Deus

Minh'alma está
Segura em Ti
Sabes bem
Que em Cristo firme estou

Se o trovão e o mar se erguendo vêm
Sobre a tempestade eu voarei
Sobre as águas Tu também és Rei
Descansarei, pois sei que és Deus

Se o trovão e o mar se erguendo vêm
Sobre a tempestade eu voarei
Sobre as águas Tu também és Rei
Descansarei, pois sei que és Deus

Minh'alma está
Segura em Ti
Sabes bem
Que em Cristo firme estou

Se o trovão e o mar se erguendo vêm
Sobre a tempestade eu voarei
Sobre as águas Tu também és Rei
Descansarei, pois sei que és Deus

Se o trovão e o mar se erguendo vêm
Sobre a tempestade eu voarei
Sobre as águas Tu também és Rei
Descansarei, pois sei que és Deus

Se o trovão e o mar se erguendo vêm
Sobre a tempestade eu voarei
Sobre as águas Tu também és Rei
Descansarei, pois sei que és Deus`,
    },
    {
      title: "Poderoso Deus",
      song: `Ao que está assentado no trono
E ao Cordeiro seja o louvor
Seja a honra, seja a glória
Seja o domínio pelos séculos dos séculos

Poderoso Deus
Poderoso Deus
Poderoso Deus
Minh'alma anseia por Ti

Ao que está assentado no trono
E ao Cordeiro seja o louvor
Seja a honra, seja a glória
Seja o domínio pelos séculos dos séculos

Poderoso Deus
Poderoso Deus
Poderoso Deus
Minh'alma anseia por Ti

Poderoso Deus
Poderoso Deus
Poderoso Deus
Minh'alma anseia por Ti

Quem já pisou no Santo dos Santos
Em outro lugar não sabe viver
E onde estiver, clamar pela glória
A glória de Deus

Quem já pisou no Santo dos Santos
Em outro lugar não sabe viver
E onde estiver, clamar pela glória
A glória de Deus

Glória, Glória
Glória, Glória

Distante de Ti, Senhor, não posso viver
Não vale a pena existir
Escuta o meu clamor
Mais que o ar que eu respiro
Preciso de Ti

E as lutas vêm tentando me afastar de Ti
Frieza, escuridão procuram me cegar
Mas eu não vou desistir
Ajuda-me, Senhor
Eu quero permanecer Contigo até o fim

Distante de Ti, Senhor, não posso viver
Não vale a pena existir
Escuta o meu clamor
Mais que o ar que eu respiro
Preciso de Ti

Distante de Ti, Senhor, não posso viver
Não vale a pena existir
Escuta o meu clamor
Mais que o ar que eu respiro
Preciso de Ti

E as lutas vêm tentando me afastar de Ti
Frieza, escuridão procuram me cegar
Mas eu não vou desistir
Ajuda-me, Senhor
Eu quero permanecer Contigo até o fim

Distante de Ti, Senhor, não posso viver
Não vale a pena existir
Escuta o meu clamor
Mais que o ar que eu respiro
Preciso de Ti`,
    },
  ];

  const filteredMusicas = musicas.filter((musica) =>
    musica.song.toLowerCase().includes(searchText.toLowerCase()) ||
    musica.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Box
      minHeight={"100vh"}
      bgGradient="linear(to-br, blue.50, purple.50, pink.50)"
      py={10}
    >
      <Container maxW={"6xl"} centerContent>
        <VStack spacing={8} width="100%">
          {/* Card de Instalação PWA */}
          {!isInstalled && (
            <Card
              width="100%"
              maxW="md"
              boxShadow="lg"
              borderRadius="xl"
              bg="gradient"
              bgGradient="linear(to-r, purple.500, pink.500)"
              color="white"
              textAlign="center"
            >
              <CardBody p={4}>
                <VStack spacing={3}>
                  <Text fontSize="lg" fontWeight="bold">
                    📱 Instale como App
                  </Text>
                  <Text fontSize="sm" opacity={0.9}>
                    Acesso rápido, funciona offline e sem ocupar espaço no navegador!
                  </Text>
                  <Button
                    colorScheme="whiteAlpha"
                    size="sm"
                    onClick={handleInstallClick}
                  >
                    Instalar Agora
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Mensagem para App Instalado */}
          {isInstalled && (
            <Alert status="success" borderRadius="xl" maxW="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="semibold">
                  🎉 App Instalado com Sucesso!
                </Text>
                <Text fontSize="sm">
                  Você está usando a versão instalada do app
                </Text>
              </Box>
            </Alert>
          )}
          {/* Banner de Instalação PWA */}
          {showInstallPrompt && (
            <Alert status="info" borderRadius="xl" boxShadow="md">
              <AlertIcon />
              <Box flex="1">
                <Text fontWeight="semibold">
                  Instale o app no seu dispositivo!
                </Text>
                <Text fontSize="sm">
                  Tenha acesso rápido e funcione offline
                </Text>
              </Box>
              <Button
                size="sm"
                colorScheme="purple"
                onClick={handleInstallClick}
                ml={2}
              >
                Instalar
              </Button>
            </Alert>
          )}

          {/* Indicador de Status da Conexão */}
          <Flex justify="space-between" alignItems="center" width="100%" maxW="md">
            <Badge
              colorScheme={isOnline ? "green" : "red"}
              fontSize="xs"
              px={3}
              py={1}
              borderRadius="full"
            >
              {isOnline ? "🌐 Online" : "⚡ Modo Offline"}
            </Badge>
            
            {/* Botão de Instalação Sempre Visível */}
            {!isInstalled && (
              <Button
                size="sm"
                colorScheme="purple"
                variant="outline"
                onClick={handleInstallClick}
                leftIcon={<Text>📱</Text>}
              >
                Instalar App
              </Button>
            )}
          </Flex>

          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, purple.500, pink.500)"
              bgClip="text"
              fontWeight="bold"
            >
              Letras de Música
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Encontre as letras das suas músicas favoritas
            </Text>
            {!isOnline && (
              <Text color="orange.500" fontSize="sm" fontStyle="italic">
                Funcionando offline - todas as músicas disponíveis!
              </Text>
            )}
          </VStack>

          {/* Search Box */}
          <Box width="100%" maxW="md">
            <Input
              placeholder="Pesquise por título ou letra da música..."
              onChange={(e) => setSearchText(e.target.value)}
              bg="white"
              border="2px"
              borderColor="gray.200"
              _hover={{ borderColor: "purple.300" }}
              _focus={{
                borderColor: "purple.500",
                boxShadow: "0 0 0 1px purple.500",
              }}
              borderRadius="xl"
              fontSize="md"
              size="lg"
            />
          </Box>

          {/* Results Counter */}
          {searchText && (
            <Badge
              colorScheme="purple"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              {filteredMusicas.length} música(s) encontrada(s)
            </Badge>
          )}

          {/* Music Cards */}
          <VStack spacing={6} width="100%">
            {filteredMusicas.map((musica) => (
              <Card
                key={`${musica.title}-${musica.song.slice(0, 50)}`}
                width="100%"
                maxW="4xl"
                boxShadow="lg"
                borderRadius="xl"
                overflow="hidden"
                bg="white"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                }}
                transition="all 0.2s"
              >
                <CardBody p={6}>
                  <VStack align="start" spacing={4}>
                    <Heading
                      as="h2"
                      size="lg"
                      color="purple.700"
                      fontWeight="semibold"
                    >
                      {musica.title}
                    </Heading>
                    <Text
                      whiteSpace="pre-wrap"
                      lineHeight={1.6}
                      color="gray.700"
                      fontSize="md"
                    >
                      {musica.song}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>

          {searchText && filteredMusicas.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" color="gray.500">
                Nenhuma música encontrada com "{searchText}" 😔
              </Text>
              <Text fontSize="sm" color="gray.400" mt={2}>
                Tente pesquisar por outras palavras
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default App;
