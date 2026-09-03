Você é o SETOR DE PLANEJAMENTO CRIATIVO da MOVE AGÊNCIA.

MISSÃO:
Entregar o planejamento criativo EXECUTÁVEL da semana para todas as empresas. A equipe de Produção não deve precisar decidir o que criar: ela deve abrir a demanda, captar, editar, criar e entregar.

DATA DE REFERÊNCIA: 2026-09-03
SEMANA OPERACIONAL: 2026-08-31 a 2026-09-04
PROTEÇÃO DA PRÓXIMA SEMANA: até 2026-09-07

REGRA-MÃE:
Planeje quais conteúdos precisam SER PRODUZIDOS nesta semana para garantir todas as publicações da semana atual e proteger a primeira publicação da próxima semana quando necessário.
Exemplo: se uma empresa publica segunda, quarta e sexta, o conteúdo desta segunda deve vir como já protegido da semana anterior; a produção desta semana deve abastecer quarta, sexta e a próxima segunda.

VOCÊ DEVE ENTREGAR UM ÚNICO JSON VÁLIDO, sem markdown, sem comentários e sem texto antes ou depois.

REGRAS CRIATIVAS OBRIGATÓRIAS:
1. Não crie conteúdos genéricos, reciclados ou iguais entre empresas.
2. Use posicionamento, público, objetivos, tom, linhas editoriais, serviços, frequência, dias de publicação e histórico recente de cada empresa.
3. Evite repetir títulos, assuntos, ganchos, formatos e estruturas já usados recentemente.
4. Cada conteúdo precisa ter intenção estratégica clara: alcance, conexão, autoridade, relacionamento, engajamento, desejo, venda, lead ou posicionamento.
5. Não invente preços, promoções, condições, dados clínicos, promessas ou informações que não foram fornecidas.
6. Varie os formatos de Reels: fala direta, POV, bastidor, demonstração, pergunta/resposta, mini-história, trend adaptada, comparação, takes + texto, situação encenada e outros formatos coerentes. Não transforme tudo em “Você sabia?” ou “3 dicas”.
7. ROTEIROS DE REELS devem ser graváveis e resultar em vídeo de NO MÁXIMO 40 SEGUNDOS.
8. Todo Reel falado deve começar com GANCHO DE FALA + GANCHO VISUAL nos primeiros segundos.
9. Depois do gancho, use FALA 01, FALA 02, FALA 03, FALA 04... apenas o necessário. Falas curtas, naturais e humanas.
10. O gancho visual deve dizer COMO começar a gravação: ação, enquadramento, movimento, objeto, ambiente, corte ou comportamento que chame atenção imediatamente.
11. Para Reel puramente visual, descreva TAKE 01, TAKE 02... + textos na tela + ritmo/execução.
12. Para Post: TÍTULO PRINCIPAL, SUBTEXTO, IDEIA VISUAL/BACK DE CRIAÇÃO, COPY DA ARTE e CTA.
13. Para Carrossel, use tipo "Post" e descreva CAPA, SLIDE 02, SLIDE 03... SLIDE FINAL + direção visual.
14. Para Stories: GANCHO/TÍTULO, TEXTO PRINCIPAL, interação quando fizer sentido, direção visual e CTA.
15. Gere legenda pronta para cada conteúdo.
16. Datas comemorativas só entram se forem realmente pertinentes. Se usar uma data, confirme a data correta antes de incluí-la.

REGRAS OPERACIONAIS:
1. Respeite a quantidade semanal contratada de Reels, Posts e Stories para a SEMANA OPERACIONAL.
2. Conteúdos marcados como reserva não contam nesse volume semanal; são proteção da próxima semana.
3. Se a empresa publica segunda-feira, crie no máximo a reserva mínima necessária para a próxima segunda, quando isso fizer sentido para manter a operação protegida.
4. productionDate é o dia em que a equipe deve executar/captar/criar aquele conteúdo. Nunca coloque productionDate depois de postDate.
5. Se postDate for segunda da semana atual, considere que ele deve estar protegido/pronto e marque productionStatusInicial="Pronto/Reservado" quando coerente.
6. Conteúdos que precisam de gravação devem usar requiresCapture=true. Artes/posts estáticos normalmente false.
7. prioridade deve ser "Obrigatória", "Meta" ou "Adiantamento". Reserva futura normalmente é "Adiantamento"; publicação próxima sem material é "Obrigatória".
8. Preserve exatamente o companyId recebido.

SCHEMA OBRIGATÓRIO:
{
  "plannerVersion":"MOVE_CREATIVE_V2",
  "titulo":"Planejamento Criativo - <período>",
  "periodo":{"inicio":"YYYY-MM-DD","fim":"YYYY-MM-DD","reservaAte":"YYYY-MM-DD"},
  "empresas":[{
    "companyId":"ID ORIGINAL",
    "empresa":"NOME",
    "propostaSemana":"Resumo claro do movimento estratégico da semana",
    "objetivoSemana":"Objetivo central",
    "linhaSemana":"Linha/editorial predominante",
    "conteudos":[{
      "id":"ID ÚNICO",
      "tipo":"Reels|Post|Stories",
      "titulo":"Título do conteúdo",
      "ideia":"Ideia/proposta executável",
      "objetivo":"Objetivo do conteúdo",
      "linhaEditorial":"Linha editorial",
      "roteiro":"Estrutura completa e pronta para produção",
      "legenda":"Legenda pronta",
      "postDate":"YYYY-MM-DD",
      "postTime":"HH:MM",
      "productionDate":"YYYY-MM-DD",
      "requiresCapture":true,
      "prioridade":"Obrigatória|Meta|Adiantamento",
      "isReserve":false,
      "productionStatusInicial":"Fila de produção|Pronto/Reservado",
      "direcaoCriativa":"Orientação visual e de produção",
      "observacoes":"Observações úteis"
    }]
  }]
}

VALIDAÇÃO FINAL:
- Confira o volume contratado de CADA empresa na semana operacional.
- Compare todos os conteúdos e elimine repetições.
- Confirme que nenhum Reel falado passa de aproximadamente 40 segundos.
- Confirme que cada Reel tem um início capaz de segurar atenção nos primeiros segundos.
- Confirme que toda empresa que precise de proteção futura recebeu reserva quando necessário.

EMPRESAS:
[
  {
    "companyId": "44acd000-eeb5-40d3-b5f4-393ddb7a6a55",
    "empresa": "CLÍNICA BEDENDO ",
    "sobre": "UMA CLÍNICA INOVADORA EM URUCUI PIAUI, COM ATENDIMENTO ODONTOLÓGICO PROFISSIONAL COM A DRA SHAMARA E OUTROS DENTISTAS E COM ATENDIMENTO CLÍNICO GERAL COM RENOMADO DOUTOR MARCOS BEDENDO. ",
    "responsavel": "DRA SHAMARA ",
    "cor": "#bfb0bb",
    "tons": "Educacional | Sério | Profissional | Premium | Acolhedor | Humano | Comercial | Familiar",
    "objetivos": "Vender mais | Atrair novos clientes | Aumentar reconhecimento da marca | Gerar engajamento",
    "linhas": "Educacional | Conexão | Autoridade | Prova social",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 1,
      "posts": 1,
      "stories": 1,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Stories",
        "titulo": "CP: QUAL CONTEÚDO VOCÊ QUER VER POR AQUI?",
        "ideia": "IDEIA: Story de engajamento para descobrir qual área desperta maior interesse no público. As respostas ajudarão a direcionar novos conteúdos e poderão iniciar conversas sobre os atendimentos.",
        "data": "2026-09-18"
      },
      {
        "tipo": "Post",
        "titulo": "CP: DOIS ATENDIMENTOS. UM SÓ COMPROMISSO: CUIDAR DE VOCÊ.",
        "ideia": "IDEIA: Post comercial e institucional para apresentar os dois principais atendimentos da Clínica Bedendo. O objetivo é facilitar a compreensão dos serviços, fortalecer o reconhecimento da marca e gerar novos agendamentos.",
        "data": "2026-09-16"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: VOCÊ CUIDA DE TODO MUNDO. MAS QUEM ESTÁ CUIDANDO DE VOCÊ?",
        "ideia": "IDEIA: Reel emocional para conversar com pessoas que priorizam a família e acabam adiando os próprios cuidados. O objetivo é gerar identificação, conexão e incentivar o agendamento médico ou odontológico.",
        "data": "2026-09-14"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: TIRE SUA DÚVIDA COM A CLÍNICA BEDENDO",
        "ideia": "IDEIA: Story de relacionamento para abrir um canal direto com o público e descobrir quais temas despertam mais interesse. As respostas também poderão originar novos conteúdos educacionais para a página.",
        "data": "2026-09-11"
      },
      {
        "tipo": "Post",
        "titulo": "CP: SEU SORRISO MERECE ACOMPANHAMENTO, NÃO IMPROVISO",
        "ideia": "IDEIA: Post de autoridade e posicionamento para valorizar a avaliação odontológica profissional. O objetivo é mostrar que cada paciente precisa de um cuidado individualizado, divulgar a equipe odontológica e estimular novos agendamentos.",
        "data": "2026-09-09"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: 3 COISAS PARA LEVAR À SUA CONSULTA MÉDICA",
        "ideia": "IDEIA: Reel educacional com orientações simples para ajudar o paciente a chegar mais preparado à consulta com o Dr. Marcos Bedendo. O objetivo é gerar salvamentos e compartilhamentos, fortalecer a autoridade profissional e divulgar o atendimento clínico geral.",
        "data": "2026-09-07"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: QUAL CUIDADO VOCÊ ESTÁ ADIANDO?",
        "ideia": "IDEIA: Story interativo para gerar identificação e respostas, além de revelar qual serviço desperta mais interesse no público. A interação também cria uma oportunidade natural para apresentar os atendimentos da clínica.",
        "data": "2026-09-04"
      },
      {
        "tipo": "Post",
        "titulo": "CP: 3 SINAIS DE QUE ESTÁ NA HORA DE CUIDAR DO SEU SORRISO",
        "ideia": "IDEIA: Post educacional para ajudar o público a reconhecer situações que merecem avaliação odontológica. O conteúdo gera identificação, fortalece a autoridade da clínica e conduz ao agendamento.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: AQUI, O CUIDADO COMEÇA PELA ESCUTA",
        "ideia": "IDEIA: Reel de conexão e autoridade para mostrar que o atendimento da Clínica Bedendo vai além de procedimentos. O objetivo é humanizar a marca, transmitir confiança e incentivar novos agendamentos.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: QUANDO FOI SEU ÚLTIMO CHECK-UP?",
        "ideia": "IDEIA: Story interativo para gerar respostas e estimular o público a refletir sobre os próprios cuidados com a saúde. A enquete aumenta o engajamento e abre espaço para uma chamada comercial.",
        "data": "2026-08-28"
      },
      {
        "tipo": "Post",
        "titulo": "CP: SUA SAÚDE NÃO DEVE SER LEMBRADA APENAS QUANDO ALGO DÓI",
        "ideia": "IDEIA: Conteúdo educacional e comercial para conscientizar o público sobre a importância do acompanhamento preventivo. O post conecta os atendimentos médico e odontológico da clínica e estimula o agendamento.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Reels",
        "titulo": "SUA SAÚDE MERECE UM OLHAR COMPLETO",
        "ideia": "IDEIA: Reel institucional para apresentar a Clínica Bedendo como referência em cuidado integrado, destacando os atendimentos odontológicos e de clínica geral. O objetivo é fortalecer a autoridade, gerar conexão e atrair novos pacientes.",
        "data": "2026-08-24"
      }
    ]
  },
  {
    "companyId": "325df152-198f-4e37-9a2a-b8932afad3be",
    "empresa": "DEGUSTAR RESTAURANTE",
    "sobre": "RESTAURANTE E BAR EM URUCUI PIAUI. CONTA UM UM CARDAPIO BEM AMPLO VARIADO, PREÇOS ACESSÍVEIS, AMBIENTE ÓTIMO PARA QUEM QUER DESCONTRAIR, COMER BEM, BEBER BEM, CONFRATERNIZAR E VIVER A EXPERIÊNCIA. ",
    "responsavel": "MAIARA ",
    "cor": "#fca311",
    "tons": "Criativo | Profissional | Humano | Próximo | Amigável | Regional",
    "objetivos": "Vender mais | Aumentar reconhecimento da marca | Gerar engajamento | Gerar desejo",
    "linhas": "Educacional | Autoridade | Entretenimento | Prova social",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 2,
      "posts": 0,
      "stories": 0,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Reels",
        "titulo": "CP: O COMBINADO ERA PEDIR SÓ UM TIRA-GOSTO",
        "ideia": "IDEIA: Reel de entretenimento baseado na situação em que o grupo promete fazer um pedido pequeno, mas termina com a mesa cheia. O objetivo é gerar marcações, compartilhamentos e destacar a variedade do cardápio.",
        "data": "2026-09-09"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: SEU DIA PODE TER SIDO CANSATIVO. A NOITE NÃO PRECISA SER.",
        "ideia": "IDEIA: Reel de conexão para apresentar o Degustar como o lugar ideal para desacelerar depois de um dia corrido. O objetivo é gerar identificação, despertar desejo e vender a experiência completa do restaurante.",
        "data": "2026-09-07"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: VOCÊ SÓ PODE ESCOLHER UM",
        "ideia": "IDEIA: Reel interativo no estilo batalha de pratos para gerar comentários e apresentar a variedade do cardápio. O objetivo é aumentar o engajamento, despertar desejo e incentivar o público a visitar o restaurante.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: DA COZINHA PARA A SUA MESA",
        "ideia": "IDEIA: Reel focado em autoridade e desejo, mostrando a trajetória do prato desde o preparo até o momento em que chega à mesa. O objetivo é valorizar a apresentação, o cuidado da equipe e a experiência oferecida pelo Degustar.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: TODO GRUPO DE AMIGOS TEM ESSAS PESSOAS",
        "ideia": "IDEIA: Reel de entretenimento com situações nas quais o público se reconheça. O objetivo é gerar comentários e marcações enquanto apresenta o Degustar como lugar ideal para comer, beber e confraternizar.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: NÃO ASSISTA A ESTE VÍDEO COM FOME",
        "ideia": "IDEIA: Reel visual e dinâmico para despertar desejo imediato pelos pratos do Degustar. O objetivo é aumentar o alcance, gerar compartilhamentos e transformar a vontade em visita ao restaurante.",
        "data": "2026-08-24"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: QUAL É O SEU COMBO PERFEITO?",
        "ideia": "IDEIA: Estimular respostas e compartilhamentos por meio de uma escolha divertida, enquanto apresenta o Degustar como opção para diferentes momentos e preferências.",
        "data": "2026-08-19"
      },
      {
        "tipo": "Post",
        "titulo": "CP: NÃO É SÓ COMER, É VIVER O MOMENTO",
        "ideia": "IDEIA: Vender a experiência completa do Degustar, destacando que o restaurante é o lugar ideal para comer bem, beber, conversar e confraternizar. O objetivo é gerar desejo e fazer o público imaginar seu próximo encontro no ambiente.",
        "data": "2026-08-17"
      }
    ]
  },
  {
    "companyId": "78ad1490-68c3-43d4-9bf9-499f814ee709",
    "empresa": "AMERICAN BAR ",
    "sobre": "AMERICAN BAR É UM BAR EM URUÇUÍ PIAUI, BEM CONHECIDO, É POINT SOCIÁVEL DOS JOVENS DA CIDADE MUITO FAMOSO POR SEUS DRINKS E COQUETEIS, TIRA GOSTOS, CERVEJA GELADA E É UM AMBIENTE BEM ACOLHEDOR E HUMANO.\n\n### PERFIL DE POSICIONAMENTO\n\n**AMERICAN BAR — Onde a Resenha Começa**\n\nO American Bar será posicionado como o ponto de partida dos melhores encontros, comemorações e noites entre amigos em Uruçuí.\n\n**Conceito fixo para os conteúdos:**\n**“Toda boa resenha começa no American.”**\n\n**Quadro recorrente:**\n**A Resenha Começa Aqui**\n\nConteúdos mostrando a chegada dos amigos, o primeiro brinde, os drinks sendo preparados, a cerveja gelada chegando e os tira-gostos abrindo oficialmente a noite.\n\n**Assinatura da marca:**\n**American Bar — onde a resenha começa.**\n\nUm posicionamento jovem, festeiro e acolhedor que apresenta o bar como o lugar onde as pessoas se encontram e os melhores momentos ganham vida.\n",
    "responsavel": "CLOVIS ",
    "cor": "#fca311",
    "tons": "Festeiro | Criativo | Profissional | Humano | Próximo | Amigável",
    "objetivos": "Vender mais | Atrair novos clientes | Criar conexão com o público | Aumentar visitas ao perfil",
    "linhas": "Educacional | Entretenimento | Relacionamento | Engajamento | Tendências",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 1,
      "posts": 1,
      "stories": 0,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Post",
        "titulo": "CP: CONVOQUE A TROPA PARA A PRÓXIMA RESENHA",
        "ideia": "IDEIA: Post de engajamento criado para incentivar marcações e compartilhamentos entre amigos. O conteúdo transforma a própria publicação em um convite para visitar o American.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: EU NEM IA SAIR HOJE",
        "ideia": "IDEIA: Reel de entretenimento baseado em uma situação comum entre amigos: a pessoa diz que ficará em casa, mas muda de ideia quando o grupo chama para o American. O objetivo é gerar identificação, compartilhamentos e marcações.",
        "data": "2026-09-01"
      },
      {
        "tipo": "Post",
        "titulo": "CP: TODA BOA RESENHA TEM 3 INGREDIENTES",
        "ideia": "IDEIA: Post de posicionamento e engajamento que associa os principais produtos e a experiência do American a uma noite perfeita. O objetivo é despertar desejo, gerar marcações entre amigos e reforçar a assinatura da marca.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: A RESENHA COMEÇA AQUI — EP. 01",
        "ideia": "IDEIA: Apresentar o quadro recorrente da marca mostrando os elementos que dão início a uma boa noite: chegada dos amigos, primeiro brinde, bebida gelada e tira-gosto na mesa. O objetivo é fortalecer o posicionamento do American como ponto de encontro dos jovens de Uruçuí e gerar desejo de viver essa experiência.",
        "data": "2026-08-25"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: O ROLÊ COMEÇA AQUI",
        "ideia": "IDEIA: Posicionar o American Bar como o ponto de encontro ideal para jovens adultos de Uruçuí. O conteúdo vende a experiência completa — ambiente acolhedor, drinks, tira-gostos, cerveja gelada e boas companhias — gerando desejo e movimento no bar.",
        "data": "2026-08-19"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: SEU DRINK REVELA SUA PERSONALIDADE",
        "ideia": "IDEIA: Criar um conteúdo divertido e compartilhável, associando estilos de drinks a diferentes personalidades. O objetivo é gerar comentários, marcações e visitas ao perfil, enquanto destaca um dos principais atrativos do American Bar.",
        "data": "2026-08-18"
      }
    ]
  },
  {
    "companyId": "be1315a5-cc5c-47d6-af3f-e017b55ef730",
    "empresa": "ESCOLINHA MENINO JESUS ",
    "sobre": "ESCOLA DO INFANTIL AO NONO ANO EM URUCUI PIAUI. ESCOLA COM GRANDES ANOS DE CARREIRA E VARIAS GERAÇÕES PASSADAS POR LÁ. A ESCOLINHA DEVE FAZ\\ER COM QUE AS PESSOAS NAO PENSE DUAS VEZES ANTES DE MATRICULAR SEUS FILHOS E ONDE DEVEM CONFIAR PARA MATRICULAR SEUS FILHOS, DEVEM CONFIAR E MATRICULAR NA ESCOLINHA MENINO JESUS.",
    "responsavel": "LISIANE ",
    "cor": "#ff0026",
    "tons": "Educacional | Infantil | Profissional | Popular | Institucional | Acolhedor | Humano | Amigável | Familiar",
    "objetivos": "Vender mais | Atrair novos clientes | Fortalecer autoridade | Criar conexão com o público | Gerar desejo | Impulsionar matrículas/agendamentos",
    "linhas": "Educacional | Conexão | Vendas | Relacionamento | Engajamento",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 1,
      "posts": 1,
      "stories": 0,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Post",
        "titulo": "CP: UM PAÍS MAIS FORTE COMEÇA PELA EDUCAÇÃO",
        "ideia": "IDEIA: Post especial para o Dia da Independência, conectando a data ao papel transformador da educação. O objetivo é gerar identificação, fortalecer o posicionamento institucional e mostrar que a escola contribui para formar cidadãos preparados para o futuro.",
        "data": "2026-09-09"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: MAIS QUE UMA ESCOLA, UMA ESCOLHA PARA CADA FASE",
        "ideia": "IDEIA: Reel comercial e institucional para apresentar os principais motivos que tornam a Escolinha Menino Jesus uma escolha segura para as famílias: experiência, continuidade do Infantil ao 9º ano, ensino, valores e acolhimento. O objetivo é fortalecer a confiança e incentivar contatos sobre matrículas.",
        "data": "2026-09-07"
      },
      {
        "tipo": "Post",
        "titulo": "CP: A ESCOLHA DE HOJE ACOMPANHA O FUTURO DO SEU FILHO",
        "ideia": "IDEIA: Post institucional e comercial para destacar a importância de escolher uma escola que una ensino, cuidado e experiência. O objetivo é gerar desejo, transmitir segurança aos responsáveis e estimular contatos sobre matrículas.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: UMA ESCOLA, MUITAS GERAÇÕES",
        "ideia": "IDEIA: Reel emocional para mostrar que a Escolinha Menino Jesus faz parte da história de diferentes gerações de Uruçuí. O objetivo é fortalecer confiança, autoridade e conexão com famílias que já conhecem a escola ou procuram um lugar seguro para seus filhos.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Post",
        "titulo": "CP: UMA BOA ESCOLA ENSINA MUITO ALÉM DAS MATÉRIAS",
        "ideia": "IDEIA: Mostrar aos pais que uma educação de qualidade também desenvolve valores, autonomia e convivência. O conteúdo educa o público, fortalece a autoridade da escola e gera desejo por uma formação completa para os filhos.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: 3 PERGUNTAS PARA FAZER ANTES DE ESCOLHER A ESCOLA DO SEU FILHO",
        "ideia": "IDEIA: Criar um conteúdo educativo e de fácil compartilhamento que ajude os pais no processo de decisão. As perguntas valorizam os diferenciais da Escolinha Menino Jesus, despertam curiosidade e incentivam visitas ao perfil.\n\nGANCHO:\n“Vai escolher uma escola para o seu filho? Então, não faça a matrícula antes de responder a estas três perguntas!”\n\nFALA 01:\n“A escola oferece um ensino de qualidade? Acompanha de perto o desenvolvimento do aluno? E transmite confiança para toda a família?”\n\nFALA 02:\n“Na Escolinha Menino Jesus, ensino, cuidado e experiência caminham juntos. Conheça nossa história e descubra por que tantas famílias confiam na gente!”\n\nIDEIA CRIATIVA DE CENÁRIO + INÍCIO DA GRAVAÇÃO DO GANCHO:\nProduzir o Reel com imagens já disponíveis da escola. Começar com um take rápido da fachada e o gancho em narração, enquanto surge na tela a frase “Antes de matricular…”. Apresentar cada pergunta sobre imagens de atividades em sala, acompanhamento dos professores e momentos de convivência. Usar cortes dinâmicos e números grandes para marcar as três perguntas. Finalizar com imagens de alunos felizes, logotipo e chamada para visitar o perfil e conhecer a escola.",
        "data": "2026-08-24"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: POR QUE TANTAS FAMÍLIAS CONFIAM NA ESCOLINHA MENINO JESUS?",
        "ideia": "IDEIA: Apresentar a tradição da escola como uma prova de confiança, mostrando que várias gerações já passaram pela instituição. O objetivo é fortalecer a autoridade, gerar segurança nos pais e incentivar novas matrículas.",
        "data": "2026-08-19"
      },
      {
        "tipo": "Post",
        "titulo": "CP: GERAÇÕES QUE CRESCERAM COM A GENTE",
        "ideia": "IDEIA: Valorizar a história e a tradição da Escolinha Menino Jesus, criando conexão emocional com antigas e novas famílias. O conteúdo reforça que a confiança construída ao longo dos anos é um motivo seguro para escolher onde matricular os filhos.",
        "data": "2026-08-18"
      }
    ]
  },
  {
    "companyId": "471a2a21-96a8-40b1-a0c7-9d49312fc836",
    "empresa": "CLINICA MARIA EDUARDA ",
    "sobre": "UMA CLÍNICA ODONTOLÓGICA ESPECIALIZADA PRINCIPALMENTE NO ATENDIMENTO ODONTOPEDIATRA EM URUCUI PIAUI, A DRA MARIA EDUARDA MARQUES E CONHECIDA POR SER A TIA DAS CRIANÇAS DENTISTA. A CLINCIA ATENDE OUTRAS ESPECIALIDADES, MAS SEU FORTE É ODONTOPEDIATRIA.",
    "responsavel": "MARIA EDUARDA ",
    "cor": "#f8b4f9",
    "tons": "Criativo | Infantil | Divertido | Profissional | Acolhedor | Humano | Próximo | Amigável | Comercial | Familiar",
    "objetivos": "Vender mais | Gerar leads | Atrair novos clientes | Fortalecer autoridade | Criar conexão com o público | Aumentar visitas ao perfil",
    "linhas": "Educacional | Conexão | Bastidores | Vendas | Relacionamento | Engajamento",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 2,
      "posts": 0,
      "stories": 2,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Reels",
        "titulo": "CP: COMO É A ESCOVAÇÃO NA SUA CASA?",
        "ideia": "IDEIA: Story de relacionamento para gerar identificação entre os responsáveis e conhecer as principais dificuldades das famílias. O resultado poderá orientar novos conteúdos e abrir conversas para agendamentos.",
        "data": "2026-09-11"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: MAIS CREME DENTAL SIGNIFICA MAIS PROTEÇÃO?",
        "ideia": "IDEIA: Story educativo em formato de quiz para explicar que a quantidade de creme dental deve ser apropriada para a idade. O objetivo é gerar interação e despertar dúvidas que podem ser respondidas pela profissional.",
        "data": "2026-09-09"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: O QUE EXISTE POR TRÁS DE UMA CONSULTA INFANTIL TRANQUILA?",
        "ideia": "IDEIA: Reel de bastidores e conexão para mostrar que uma experiência positiva é construída com acolhimento, linguagem adequada e respeito ao tempo da criança. O objetivo é diminuir a insegurança dos responsáveis e gerar desejo pelo atendimento.",
        "data": "2026-09-08"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: 3 CUIDADOS NA ESCOVAÇÃO QUE FAZEM DIFERENÇA",
        "ideia": "IDEIA: Reel educacional para orientar os responsáveis sobre pontos importantes da escovação infantil. O objetivo é gerar salvamentos e compartilhamentos, educar o público e fortalecer a autoridade da Dra. Maria Eduarda.",
        "data": "2026-09-07"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: SEU FILHO TEM MEDO DE IR AO DENTISTA?",
        "ideia": "IDEIA: Story de relacionamento para gerar respostas e identificar famílias que precisam de um atendimento mais acolhedor. O conteúdo cria uma oportunidade direta para apresentar o diferencial da Dra. Maria Eduarda.",
        "data": "2026-09-04"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: DENTISTA SÓ QUANDO A CRIANÇA SENTE DOR?",
        "ideia": "IDEIA: Story educacional em formato de quiz para corrigir uma percepção comum e reforçar a importância do acompanhamento preventivo desde cedo.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: POR QUE ELA É A TIA DENTISTA DAS CRIANÇAS?",
        "ideia": "IDEIA: Reel de conexão para transformar o apelido da Dra. Maria Eduarda em um elemento forte de posicionamento. O objetivo é humanizar a profissional, transmitir confiança aos responsáveis e apresentar a experiência acolhedora oferecida às crianças.",
        "data": "2026-09-01"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: A PRIMEIRA CONSULTA NÃO PRECISA ACONTECER COM DOR",
        "ideia": "IDEIA: Reel educacional para mostrar aos responsáveis que o acompanhamento odontopediátrico deve começar de forma preventiva. O objetivo é gerar salvamentos, fortalecer a autoridade da Dra. Maria Eduarda e atrair novos pacientes.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: 3 FRASES PARA NÃO DIZER ANTES DA CONSULTA",
        "ideia": "IDEIA: Orientar os responsáveis sobre como preparar a criança para o atendimento sem transmitir medo, destacando o cuidado acolhedor da clínica.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: MITO OU VERDADE?",
        "ideia": "IDEIA: Testar o conhecimento dos responsáveis, gerar interação e introduzir a importância dos cuidados com os dentes de leite.",
        "data": "2026-08-25"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: DENTE DE LEITE PRECISA MESMO DE CUIDADO?",
        "ideia": "IDEIA: Combater um mito comum, fortalecer a autoridade da Dra. Maria Eduarda e mostrar às famílias a importância do acompanhamento odontopediátrico.",
        "data": "2026-08-24"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: ESCOVAR OS DENTINHOS É UM DESAFIO AÍ?",
        "ideia": "IDEIA: Gerar identificação e interação com os responsáveis por meio de uma situação comum na rotina infantil, abrindo espaço para futuros conteúdos educativos.",
        "data": "2026-08-21"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: COMO TRANSFORMAMOS A CONSULTA EM UMA EXPERIÊNCIA DIVERTIDA",
        "ideia": "IDEIA: Mostrar o lado humano e acolhedor do atendimento odontopediátrico, diminuindo o receio das famílias e criando conexão com os pais. O conteúdo apresenta a Dra. Maria Eduarda como a “tia das crianças”.",
        "data": "2026-08-20"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: NÃO ESPERE O DENTINHO DOER",
        "ideia": "IDEIA: Orientar os responsáveis sobre a importância do acompanhamento odontopediátrico preventivo. O objetivo é fortalecer a autoridade da clínica, despertar atenção e incentivar agendamentos antes que surja algum incômodo.",
        "data": "2026-08-18"
      }
    ]
  },
  {
    "companyId": "67f459bd-f8ee-454a-a28f-7c7b39d0ae80",
    "empresa": "JACOBINA CONTABILIDADE",
    "sobre": "ESCRITÓRIO DE CONTABILIDADE EM URUCUI PIAUI, MOSTRAR A QUALIDADE NO SERVIÇO PRETSADO COM PESSOAS FISICAS E JURIDICAS. UM ESCRITÓRIO QUE DEVE SER REFERÊNCIA PARA QUANDO ALGUEM PENSAR EM CONTRATAR OU FAZER ALGUM SERVIÇO, PENSAR NA JACOBINA CONTABILIDADE. ",
    "responsavel": "DANIEL JACOBINA ",
    "cor": "#fd1212",
    "tons": "Educacional | Sério | Institucional | Autoridade | Especialista | Objetivo | Comercial | Sofisticado | Familiar",
    "objetivos": "Vender mais | Atrair novos clientes | Fortalecer autoridade | Gerar desejo | Impulsionar matrículas/agendamentos",
    "linhas": "Educacional | Produto/Serviço | Relacionamento | Tendências",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 1,
      "posts": 1,
      "stories": 0,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Post",
        "titulo": "CP: TODA EMPRESA QUE DESEJA CRESCER PRECISA DE UMA CONTABILIDADE PRESENTE",
        "ideia": "IDEIA: Post comercial e institucional para mostrar que o crescimento de uma empresa precisa ser acompanhado por organização e orientação contábil. O objetivo é gerar desejo pelo serviço e posicionar a Jacobina como parceira do empresário.",
        "data": "2026-09-08"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: CONTABILIDADE É SÓ PARA EMPRESA?",
        "ideia": "IDEIA: Reel educacional para mostrar que os serviços contábeis também atendem às necessidades de pessoas físicas. O objetivo é divulgar a variedade dos atendimentos da Jacobina, gerar identificação e atrair novos clientes.",
        "data": "2026-09-07"
      },
      {
        "tipo": "Post",
        "titulo": "CP: CONTABILIDADE NÃO É APENAS OBRIGAÇÃO. É DIREÇÃO.",
        "ideia": "IDEIA: Post de autoridade para reposicionar a contabilidade como ferramenta de organização e apoio nas decisões. O objetivo é valorizar o serviço prestado pela Jacobina e atrair pessoas físicas e jurídicas que buscam acompanhamento especializado.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: CONTADOR NÃO DEVE SER LEMBRADO APENAS QUANDO SURGE UM PROBLEMA",
        "ideia": "IDEIA: Reel educacional e comercial para mostrar que o acompanhamento contábil deve fazer parte da rotina de pessoas e empresas. O objetivo é combater a percepção de que o contador serve apenas para resolver pendências e posicionar a Jacobina como parceira estratégica.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: 3 SINAIS DE QUE SUA EMPRESA PRECISA DE MAIS ATENÇÃO CONTÁBIL",
        "ideia": "IDEIA: Apresentar problemas comuns que indicam a necessidade de um acompanhamento contábil mais próximo. O conteúdo educa os empresários, fortalece a autoridade da Jacobina e estimula novos atendimentos.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Post",
        "titulo": "CP: CONTABILIDADE TAMBÉM É PARA PESSOA FÍSICA",
        "ideia": "IDEIA: Mostrar que os serviços da Jacobina Contabilidade não são exclusivos para empresas. O objetivo é ampliar o público, atrair novos clientes e posicionar o escritório como referência para diferentes necessidades contábeis.",
        "data": "2026-08-24"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: SEU NEGÓCIO CRESCE. SUA CONTABILIDADE PRECISA ACOMPANHAR.",
        "ideia": "IDEIA: Despertar empresários que estão crescendo, mas ainda tratam a contabilidade apenas como obrigação. O conteúdo apresenta a Jacobina como parceira para uma gestão organizada e estimula novos atendimentos.",
        "data": "2026-08-19"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: CONTABILIDADE NÃO É APENAS PAGAR IMPOSTOS",
        "ideia": "IDEIA: Mostrar que um bom serviço contábil também ajuda o empresário a organizar, compreender e tomar decisões mais seguras para o negócio. O objetivo é educar o público e fortalecer a autoridade da Jacobina Contabilidade.",
        "data": "2026-08-18"
      }
    ]
  },
  {
    "companyId": "f202bf82-cfbd-43ab-9e6d-05517344a86a",
    "empresa": "SERVCAR AUTOCENTER ",
    "sobre": "OFOCINA AUTOMOTIVA EM URUCUI PIAUI COM MAIS DE 17 ANOS DE EXPERIENCIA CUIDADNO DE CARROS. CONHECIDO POR SEU FUNDADO O NETON. PRESTAM QUALIDADE E EXCELENCIA EM SEUS SERVIÇOS. ",
    "responsavel": "ELIZABETH ",
    "cor": "#0039e6",
    "tons": "Educacional | Criativo | Profissional | Institucional | Humano | Especialista | Comercial | Familiar",
    "objetivos": "Vender mais | Gerar engajamento | Aumentar visitas ao perfil | Aumentar alcance | Gerar desejo",
    "linhas": "Educacional | Conexão | Produto/Serviço | Vendas | Engajamento",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 1,
      "posts": 1,
      "stories": 2,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Stories",
        "titulo": "CP: VAI VIAJAR NESTE FERIADO?",
        "ideia": "IDEIA: Story de engajamento para identificar seguidores que pretendem pegar a estrada e criar uma oportunidade direta para divulgar a avaliação do veículo.",
        "data": "2026-09-11"
      },
      {
        "tipo": "Post",
        "titulo": "CP: ANTES DE PEGAR A ESTRADA, PASSE NA SERVCAR",
        "ideia": "IDEIA: Post comercial para associar a oficina à segurança e tranquilidade antes das viagens. O objetivo é gerar desejo pelo serviço e incentivar o agendamento de uma avaliação preventiva.",
        "data": "2026-09-09"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: VAI PEGAR A ESTRADA? CONFIRA ISTO ANTES",
        "ideia": "IDEIA: Reel educacional aproveitando o período do feriado para orientar os motoristas sobre itens importantes antes de uma viagem. O objetivo é gerar salvamentos, aumentar o alcance e divulgar a avaliação preventiva da ServCar.",
        "data": "2026-09-07"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: QUANDO FOI A ÚLTIMA AVALIAÇÃO DO SEU CARRO?",
        "ideia": "IDEIA: Story interativo para fazer o público refletir sobre os cuidados com o veículo e identificar potenciais clientes que estão adiando uma visita à oficina.",
        "data": "2026-09-04"
      },
      {
        "tipo": "Post",
        "titulo": "CP: NÃO ESPERE O CARRO PARAR PARA PROCURAR UMA OFICINA",
        "ideia": "IDEIA: Post educacional e comercial para reforçar a importância do acompanhamento preventivo do veículo. O objetivo é estimular o cliente a buscar uma avaliação antes que pequenos sinais se transformem em transtornos maiores.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: HÁ MAIS DE 17 ANOS, ESSA HISTÓRIA COMEÇOU COM O NETON",
        "ideia": "IDEIA: Reel institucional e emocional para apresentar a trajetória da ServCar e valorizar o trabalho do fundador. O objetivo é humanizar a marca, fortalecer a confiança e mostrar que a experiência da oficina foi construída ao longo dos anos.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: TESTE RÁPIDO DO VOLANTE",
        "ideia": "IDEIA: Estimular o motorista a observar o comportamento do próprio carro e interagir com o conteúdo. A enquete funciona como diagnóstico inicial e prepara o público para a oferta do próximo Story.",
        "data": "2026-08-28"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: 3 HÁBITOS QUE ACABAM COM A SUSPENSÃO DO SEU CARRO",
        "ideia": "IDEIA: Criar um conteúdo educativo, rápido e compartilhável, mostrando erros comuns cometidos pelos motoristas. O objetivo é aumentar o alcance, demonstrar conhecimento técnico e despertar a necessidade de uma revisão preventiva.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: ALINHAMENTO E BALANCEAMENTO NÃO SÃO A MESMA COISA",
        "ideia": "IDEIA: Explicar de forma simples a diferença entre dois serviços que geram dúvidas entre os motoristas. O conteúdo fortalece a autoridade técnica da ServCar e ajuda o público a identificar quando o carro precisa de atendimento.",
        "data": "2026-08-24"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: ESSE BARULHO É NORMAL?",
        "ideia": "IDEIA: Gerar identificação e interação com motoristas que perceberam ruídos no veículo, preparando o público para o Story seguinte e para a oferta de avaliação.",
        "data": "2026-08-21"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: SEU CARRO AVISA ANTES DE PARAR",
        "ideia": "IDEIA: Alertar os motoristas sobre sinais que não devem ser ignorados, demonstrando conhecimento técnico e criando urgência para procurar a oficina antes que o problema fique mais caro.\n",
        "data": "2026-08-19"
      },
      {
        "tipo": "Post",
        "titulo": "CP: HÁ 17 ANOS, SEU CARRO EM BOAS MÃOS",
        "ideia": "IDEIA: Apresentar a experiência da ServCar como prova de confiança e qualidade. O objetivo é criar conexão com os motoristas de Uruçuí, fortalecer a autoridade da oficina e estimular novos atendimentos.",
        "data": "2026-08-18"
      }
    ]
  },
  {
    "companyId": "b1d4d77e-dde8-4b5c-b163-46f454947981",
    "empresa": "TOTAL FIBRA ",
    "sobre": "PROVEDOR DE INTERNET QUE VEIO PRA REVOLUCIONAR A CONEXÃO DE URUCUI PIAUI. SAO NOVOS NA CIDADE, TEM 2 CONCORRENTES FORTES MAS ESTÃO REVOLUCIONANDO NA CONEXÃO MAIS RAPIDA E COM PLANOS A PARTIR DE R$99,90",
    "responsavel": "CLEILSON ",
    "cor": "#eb8900",
    "tons": "Educacional | Descontraído | Profissional | Popular | Humano | Especialista | Comercial | Vendedor | Exclusivo",
    "objetivos": "Vender mais | Gerar engajamento | Criar conexão com o público | Aumentar alcance | Gerar desejo",
    "linhas": "Educacional | Conexão | Oferta | Produto/Serviço | Engajamento",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 1,
      "posts": 1,
      "stories": 0,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Post",
        "titulo": "CP: SUA CASA INTEIRA PEDE UMA CONEXÃO À ALTURA",
        "ideia": "IDEIA: Post comercial para mostrar como a internet está presente em diferentes momentos da rotina familiar. O objetivo é gerar desejo, atrair novos assinantes e reforçar a Total Fibra como uma opção moderna para Uruçuí.",
        "data": "2026-09-10"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: O LUGAR DO ROTEADOR PODE AFETAR SEU WI-FI",
        "ideia": "IDEIA: Reel educacional para mostrar que o posicionamento do roteador influencia a distribuição do sinal dentro de casa. O objetivo é gerar salvamentos, educar os clientes e posicionar a Total Fibra como especialista em conexão.",
        "data": "2026-09-08"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: DO OUTRO LADO DA CONEXÃO, TEM UMA EQUIPE PRONTA PARA VOCÊ",
        "ideia": "IDEIA: Reel humano e institucional para aproximar a equipe de suporte dos clientes. O objetivo é mostrar que a Total Fibra não entrega apenas internet, mas atendimento próximo, profissional e preparado para ajudar quando o cliente precisar.",
        "data": "2026-09-04"
      },
      {
        "tipo": "Post",
        "titulo": "CP: SUA NOVA INTERNET COMEÇA EM R$ 99,90",
        "ideia": "IDEIA: Post comercial para apresentar o preço inicial dos planos e posicionar a Total Fibra como uma nova opção de internet em Uruçuí. O objetivo é gerar desejo, visitas ao perfil e contatos para contratação.",
        "data": "2026-09-03"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: AGORA A TOTAL FIBRA TAMBÉM ESTÁ NA PALMA DA SUA MÃO",
        "ideia": "IDEIA: Reel de novidade para apresentar os aplicativos da Total Fibra, agora disponíveis na Play Store e na App Store. O objetivo é divulgar a facilidade oferecida aos clientes e fortalecer a imagem de uma empresa moderna, acessível e conectada.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: A INTERNET SEMPRE TRAVA NO PIOR MOMENTO",
        "ideia": "IDEIA: Reel de identificação e entretenimento para representar situações frustrantes causadas por uma conexão instável. O objetivo é gerar compartilhamentos, apresentar a Total Fibra como solução e atrair novos assinantes.",
        "data": "2026-09-01"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: O LUGAR DO ROTEADOR PODE ESTAR PREJUDICANDO SEU WI-FI",
        "ideia": "IDEIA: Ensinar de forma simples como a posição do roteador interfere na distribuição do sinal. O conteúdo fortalece a autoridade da Total Fibra, gera compartilhamentos e aproxima a marca do público.",
        "data": "2026-08-27"
      },
      {
        "tipo": "Post",
        "titulo": "CP: SUA CASA CONECTADA SEM PESAR NO BOLSO",
        "ideia": "IDEIA: Apresentar a Total Fibra como uma alternativa acessível para diferentes atividades da rotina. O objetivo é divulgar a oferta, gerar desejo e incentivar novos clientes a consultarem a disponibilidade.",
        "data": "2026-08-25"
      }
    ]
  },
  {
    "companyId": "261da8ad-7f83-41f4-a91e-eb33a651ab93",
    "empresa": "DENTSOFT ODONTOSHOP ",
    "sobre": "LOJA DE PRODUTOS ODONTOLÓGICOS E MATERIAS DESCARTÁVEIS ESTÉTICOS. SEU PÚBLICO PRINCIPAL SAO DENTISTAS, VENDER PARA DENTISTAS DA CIDADE E DA REGIÃO DE CIDADE PRÓXIMAS, OFERECENDO A QUALIDADE, PREÇO ACESSÍVEL E BOM ATENDIMENTO. DENTISTAS DEVEM COMPRAR COM A DENTSOFT ",
    "responsavel": "IZADORA VASCONCELOS ",
    "cor": "#09d7ca",
    "tons": "Educacional | Profissional | Próximo | Amigável | Comercial | Vendedor | Provocativo | Confiante | Familiar",
    "objetivos": "Vender mais | Atrair novos clientes | Criar conexão com o público | Aumentar visitas ao perfil | Aumentar alcance",
    "linhas": "Educacional | Produto/Serviço | Vendas | Relacionamento | Engajamento",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 1,
      "posts": 1,
      "stories": 1,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Stories",
        "titulo": "CP: COMO VOCÊ FAZ AS COMPRAS DO CONSULTÓRIO?",
        "ideia": "IDEIA: Story de engajamento para identificar o comportamento de compra dos dentistas e reforçar a importância de planejar a reposição dos materiais.",
        "data": "2026-09-10"
      },
      {
        "tipo": "Post",
        "titulo": "CP: UM BOM FORNECEDOR ENTREGA MAIS DO QUE PRODUTOS",
        "ideia": "IDEIA: Post de posicionamento para destacar que qualidade, preço e atendimento devem caminhar juntos. O objetivo é diferenciar a DentSoft e gerar desejo nos profissionais que buscam uma fornecedora próxima e confiável.",
        "data": "2026-09-09"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: 3 SINAIS DE QUE ESTÁ NA HORA DE REPOR SEU ESTOQUE",
        "ideia": "IDEIA: Reel educacional para ajudar dentistas a identificarem o momento de fazer um novo pedido. O objetivo é gerar salvamentos, reforçar a importância do planejamento e apresentar a DentSoft como fornecedora de confiança.",
        "data": "2026-09-07"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: QUAL PRODUTO NÃO PODE FALTAR NO SEU CONSULTÓRIO?",
        "ideia": "IDEIA: Story de relacionamento para estimular respostas dos dentistas e descobrir quais produtos possuem maior demanda. As respostas podem orientar ofertas e conteúdos futuros.",
        "data": "2026-09-03"
      },
      {
        "tipo": "Post",
        "titulo": "CP: SEU CONSULTÓRIO NÃO PODE PARAR POR FALTA DE MATERIAL",
        "ideia": "IDEIA: Post comercial e provocativo para mostrar que um estoque bem-organizado faz parte de um atendimento profissional. O objetivo é gerar desejo pelos produtos e posicionar a DentSoft como fornecedora de confiança para dentistas da cidade e região.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: O MATERIAL ACABOU JUSTO ANTES DO PRÓXIMO PACIENTE",
        "ideia": "IDEIA: Reel de identificação para representar uma situação que nenhum dentista quer enfrentar. O objetivo é gerar compartilhamentos, apresentar a DentSoft como fornecedora próxima e estimular pedidos.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: PREÇO OU QUALIDADE?",
        "ideia": "IDEIA: Gerar interação com uma pergunta relevante para os dentistas e reforçar que a Dentsoft oferece as duas vantagens na mesma compra.\n",
        "data": "2026-08-27"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: 3 PONTOS PARA AVALIAR ANTES DE COMPRAR MATERIAIS ODONTOLÓGICOS",
        "ideia": "IDEIA: Orientar dentistas a comprarem com mais segurança, reforçando os diferenciais da Dentsoft e incentivando novos pedidos.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Post",
        "titulo": "CP: PREÇO IMPORTA. QUALIDADE TAMBÉM.",
        "ideia": "IDEIA: Provocar os dentistas a avaliarem não apenas o valor, mas também a qualidade e a procedência dos materiais utilizados. O objetivo é posicionar a Dentsoft como a escolha que une preço acessível, confiança e bom atendimento.",
        "data": "2026-08-24"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: QUAL MATERIAL SEMPRE ACABA PRIMEIRO?",
        "ideia": "IDEIA: Criar identificação com a rotina dos dentistas e gerar interação. A enquete também reforça que a Dentsoft possui soluções para manter o consultório abastecido.",
        "data": "2026-08-20"
      },
      {
        "tipo": "Post",
        "titulo": "CP: SEU CONSULTÓRIO NÃO PODE PARAR",
        "ideia": "IDEIA: Alertar os dentistas sobre a importância de manter os materiais essenciais sempre disponíveis. O conteúdo apresenta a Dentsoft como uma parceira confiável para a rotina clínica, destacando qualidade, preço acessível e atendimento próximo.",
        "data": "2026-08-18"
      }
    ]
  },
  {
    "companyId": "9c50621a-4940-4e3a-aa22-a3fd4ecca647",
    "empresa": "LABEN CLINICA ",
    "sobre": "CLINICA, LABORATORIO DE ANALISES CLINICAS EM URUCUI PIAUI, EXAMES COMO DE SEXAGEM FETAL, TESTES DE ALERGIAS, TOXICOLOGICO, TESTES DE DNA, TESTE DO PEZINHO, HEMOGRAMA COMPLETO, EXAMES BIOQUÍMICOS, TESTE DE ALCOOL E DROGAS E OUTROS. ",
    "responsavel": "BENJAMYN ",
    "cor": "#00c217",
    "tons": "Educacional | Profissional | Institucional | Comercial | Familiar",
    "objetivos": "Vender mais | Criar conexão com o público | Aumentar visitas ao perfil | Educar o público",
    "linhas": "Educacional | Autoridade | Produto/Serviço | Datas comemorativas",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 1,
      "posts": 1,
      "stories": 0,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Post",
        "titulo": "CP: A CONFIANÇA NO RESULTADO COMEÇA ANTES DA ANÁLISE",
        "ideia": "IDEIA: Post de autoridade para valorizar os cuidados envolvidos em um exame laboratorial, desde a identificação e orientação até a análise. O objetivo é fortalecer a percepção de profissionalismo e gerar preferência pela LABEN.",
        "data": "2026-09-09"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: TODO EXAME PRECISA DE JEJUM?",
        "ideia": "IDEIA: Reel educacional para explicar que cada exame pode exigir um preparo diferente. O objetivo é gerar salvamentos, evitar dúvidas antes da coleta e posicionar a LABEN como fonte confiável de orientação.",
        "data": "2026-09-07"
      },
      {
        "tipo": "Post",
        "titulo": "CP: CUIDADO PARA CADA FASE DA VIDA",
        "ideia": "IDEIA: Post institucional e comercial para mostrar que a LABEN acompanha diferentes momentos da família, desde os primeiros cuidados com o bebê até os exames de rotina dos adultos. O objetivo é criar conexão e valorizar a variedade de serviços.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: VOCÊ SABIA QUE A LABEN REALIZA TODOS ESTES EXAMES?",
        "ideia": "IDEIA: Reel dinâmico para apresentar a variedade de exames disponíveis e mostrar que a LABEN atende diferentes necessidades em um só lugar. O objetivo é aumentar o reconhecimento, gerar compartilhamentos e divulgar os serviços.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: PRECISA REALIZAR ALGUM EXAME?",
        "ideia": "IDEIA: Abrir um canal direto para dúvidas e gerar oportunidades de atendimento. A caixa de perguntas permite que o público consulte se a Laben realiza o exame de que precisa.",
        "data": "2026-08-28"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: VOCÊ SABIA QUE PODE REALIZAR TODOS ESTES EXAMES NA LABEN?",
        "ideia": "IDEIA: Apresentar a variedade de exames oferecidos pela clínica, aumentando o reconhecimento da marca e fazendo o público lembrar da Laben sempre que precisar de um laboratório.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Post",
        "titulo": "CP: O PRIMEIRO CUIDADO TAMBÉM MERECE CONFIANÇA",
        "ideia": "IDEIA: Divulgar a realização do teste do pezinho de forma acolhedora e familiar, aproximando a Laben das mães e dos pais que estão vivendo os primeiros momentos com o bebê.",
        "data": "2026-08-24"
      },
      {
        "tipo": "Stories",
        "titulo": "CP: QUAL EXAME VOCÊ QUER CONHECER MELHOR?",
        "ideia": "IDEIA: Gerar interação e descobrir quais serviços despertam mais interesse no público, ajudando a direcionar os próximos conteúdos da Laben.",
        "data": "2026-08-21"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: SEUS EXAMES TAMBÉM CONTAM A HISTÓRIA DA SUA SAÚDE",
        "ideia": "IDEIA: Reforçar a importância de realizar os exames solicitados pelo profissional de saúde e apresentar a variedade de serviços da Laben. O conteúdo fortalece a autoridade e estimula novos atendimentos.",
        "data": "2026-08-19"
      },
      {
        "tipo": "Post",
        "titulo": "CP: MENINO OU MENINA? UMA DESCOBERTA CHEIA DE EMOÇÃO",
        "ideia": "IDEIA: Divulgar o exame de sexagem fetal de maneira emocional e familiar. O objetivo é gerar desejo, criar conexão com gestantes e apresentar a Laben como o laboratório escolhido para viver esse momento especial.",
        "data": "2026-08-18"
      }
    ]
  },
  {
    "companyId": "d077aa5a-3275-4fd7-bb2f-63896a36b0a3",
    "empresa": "FARMABEM ",
    "sobre": "FARMACIA EM URUCUI PIAUI ",
    "responsavel": "BIANCA SARAIVA",
    "cor": "#fd1212",
    "tons": "Educacional | Profissional | Próximo | Familiar",
    "objetivos": "Vender mais | Gerar engajamento | Criar conexão com o público | Aumentar visitas ao perfil | Aumentar alcance",
    "linhas": "Educacional | Produto/Serviço | Vendas | Relacionamento",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 1,
      "posts": 1,
      "stories": 0,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Post",
        "titulo": "CP: FARMÁCIA NÃO É SÓ COMPRAR. É SER BEM ATENDIDO.",
        "ideia": "IDEIA: Post institucional e comercial para valorizar o atendimento próximo como diferencial da FarmaBem. O objetivo é criar conexão, fortalecer o reconhecimento da marca e incentivar visitas à loja.",
        "data": "2026-09-09"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: FUNCIONOU PARA OUTRA PESSOA. MAS SERÁ QUE SERVE PARA VOCÊ?",
        "ideia": "IDEIA: Reel educacional para alertar sobre o risco de utilizar medicamentos indicados por amigos ou familiares. O objetivo é gerar compartilhamentos, reforçar o uso responsável e posicionar a FarmaBem como uma farmácia que também oferece orientação.",
        "data": "2026-09-07"
      },
      {
        "tipo": "Post",
        "titulo": "CP: QUANDO SUA FAMÍLIA PRECISAR, CONTE COM QUEM ESTÁ PERTO",
        "ideia": "IDEIA: Post comercial e emocional para posicionar a FarmaBem como uma farmácia próxima e presente na rotina das famílias de Uruçuí. O objetivo é fortalecer a conexão com o público e aumentar as visitas à loja.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: 3 LUGARES ONDE VOCÊ NÃO DEVE GUARDAR MEDICAMENTOS",
        "ideia": "IDEIA: Reel educacional para orientar as famílias sobre o armazenamento correto dos medicamentos. O objetivo é gerar salvamentos, compartilhamentos e posicionar a FarmaBem como fonte de informação e cuidado.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: 3 ERROS AO GUARDAR MEDICAMENTOS EM CASA",
        "ideia": "IDEIA: Oferecer uma orientação útil e compartilhável para as famílias, fortalecendo a autoridade e a proximidade da FarmaBem. O conteúdo educa o público e aumenta o potencial de alcance e visitas ao perfil.",
        "data": "2026-08-27"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: 3 MOTIVOS PARA TER UMA FARMÁCIA DE CONFIANÇA",
        "ideia": "IDEIA: Mostrar que escolher uma farmácia vai além da compra de produtos. O conteúdo destaca proximidade, atendimento e orientação, criando conexão e incentivando o público a escolher a FarmaBem.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: CUIDAR DA SUA FAMÍLIA COMEÇA COM UMA BOA ORIENTAÇÃO",
        "ideia": "IDEIA: Posicionar a FarmaBem como uma farmácia próxima, confiável e preparada para atender as necessidades das famílias de Uruçuí. O objetivo é fortalecer a conexão com o público, atrair novos clientes e valorizar o atendimento profissional.",
        "data": "2026-08-25"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: CADA FAMÍLIA TEM UMA FARMÁCIA EM QUE CONFIA",
        "ideia": "IDEIA: Trabalhar o sentimento de confiança e proximidade, posicionando a FarmaBem como a farmácia que acompanha as famílias de Uruçuí em diferentes momentos.",
        "data": "2026-08-24"
      }
    ]
  },
  {
    "companyId": "b9eaa5b8-b88a-46d9-8db8-306a2dbb170c",
    "empresa": "POSTO SÃO MIGUEL ",
    "sobre": "POSTO SÃO MIGUEL É UM POSTO DE GASOLINA EM URUÇUÍ PIAUI COM 4 ANOS JA DE MERCADO. UM POSTO COM GRANDES CONCORRENTES MAS POSSUEM GRANDE QUALIDADE E ECONOMIA.",
    "responsavel": "NAYRA MARTINS ",
    "cor": "#040fa9",
    "tons": "Sério | Profissional | Institucional | Autoridade | Comercial | Exclusivo | Sofisticado | Regional",
    "objetivos": "Vender mais | Gerar engajamento | Criar conexão com o público | Aumentar visitas ao perfil | Gerar desejo",
    "linhas": "Autoridade | Institucional | Bastidores | Engajamento",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 1,
      "posts": 2,
      "stories": 0,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Post",
        "titulo": "CP: UM PAÍS INTEIRO MOVIDO POR QUEM SEGUE EM FRENTE",
        "ideia": "IDEIA: Post institucional para o Dia da Independência, conectando a data aos trabalhadores, famílias e motoristas que movimentam o Brasil todos os dias. O objetivo é gerar identificação e fortalecer a presença regional da marca.",
        "data": "2026-09-11"
      },
      {
        "tipo": "Post",
        "titulo": "CP: 3 HÁBITOS QUE AJUDAM A ECONOMIZAR COMBUSTÍVEL",
        "ideia": "IDEIA: Post educacional para entregar informação útil aos motoristas e associar o Posto São Miguel à economia. O objetivo é gerar salvamentos, compartilhamentos e fortalecer a autoridade da marca.",
        "data": "2026-09-09"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: POR TRÁS DE CADA ABASTECIMENTO",
        "ideia": "IDEIA: Reel de bastidores para valorizar o trabalho dos frentistas e mostrar que um bom atendimento envolve atenção em cada detalhe. O objetivo é humanizar a marca, fortalecer a confiança e divulgar a experiência oferecida pelo Posto São Miguel.",
        "data": "2026-09-07"
      },
      {
        "tipo": "Post",
        "titulo": "CP: QUAL É O PRÓXIMO DESTINO?",
        "ideia": "IDEIA: Post de relacionamento para conectar o Posto São Miguel aos caminhos e histórias dos clientes. O objetivo é gerar comentários, fortalecer a presença regional e posicionar o posto como ponto de partida para diferentes viagens.",
        "data": "2026-09-04"
      },
      {
        "tipo": "Post",
        "titulo": "CP: ABASTECER TAMBÉM É UMA ESCOLHA DE CONFIANÇA",
        "ideia": "IDEIA: Post de autoridade para mostrar que o motorista não escolhe um posto apenas pela localização, mas pela segurança e confiança transmitidas. O objetivo é reforçar o posicionamento e incentivar novos abastecimentos.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: HÁ 4 ANOS, URUÇUÍ ESCOLHE SÃO MIGUEL",
        "ideia": "IDEIA: Reel institucional para valorizar a trajetória do Posto São Miguel e reforçar seus pilares: qualidade, economia e bom atendimento. O objetivo é aumentar o reconhecimento e fortalecer a confiança dos motoristas.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Post",
        "titulo": "CP: QUEM DIRIGE POR URUÇUÍ SABE ONDE FAZER UMA BOA PARADA",
        "ideia": "IDEIA: Criar identificação regional e posicionar o Posto São Miguel como uma marca presente na rotina dos motoristas da cidade. O conteúdo estimula comentários e aumenta o reconhecimento local.",
        "data": "2026-08-28"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: VOCÊ ABASTECE ANTES OU ESPERA ENTRAR NA RESERVA?",
        "ideia": "IDEIA: Usar uma situação comum e divertida para gerar identificação e comentários, enquanto posiciona o Posto São Miguel como a parada certa antes que o combustível acabe.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Post",
        "titulo": "CP: ANTES DE VOCÊ CHEGAR, TUDO JÁ ESTÁ SENDO PREPARADO",
        "ideia": "IDEIA: Mostrar os cuidados de bastidores que ajudam a manter o posto organizado e pronto para receber cada motorista. O objetivo é fortalecer a autoridade e transmitir profissionalismo.",
        "data": "2026-08-24"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: QUAL É O SEU TIPO DE MOTORISTA?",
        "ideia": "IDEIA: Criar uma interação divertida com os seguidores, conectando o Posto São Miguel aos diferentes momentos da rotina de quem dirige.",
        "data": "2026-08-21"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: SUA ESCOLHA EM CADA ABASTECIMENTO",
        "ideia": "IDEIA: Posicionar o Posto São Miguel como uma opção inteligente para quem busca qualidade e economia. O objetivo é gerar desejo e fazer o motorista lembrar da marca na hora de abastecer.",
        "data": "2026-08-19"
      },
      {
        "tipo": "Post",
        "titulo": "CP: HÁ 4 ANOS MOVIMENTANDO URUÇUÍ",
        "ideia": "IDEIA: Celebrar a trajetória do Posto São Miguel e reforçar que a confiança conquistada ao longo desses quatro anos é resultado de qualidade, economia e compromisso com os motoristas.",
        "data": "2026-08-18"
      }
    ]
  },
  {
    "companyId": "d76ff9e8-b773-4041-80f8-39cd5f0117d9",
    "empresa": "MOVE AGENCIA ",
    "sobre": "AGENCIA DE MARKETING FOCADA EM GERENCIAMENTO DE REDES SOCIAIS SOCIAL MEDIA E SERVIÇOS DE AUDIOVISUAL (CAPTAÇÃO E CRIAÇÃO DE VÍDEOS E FOTOGRAFIA) , NOSSO FOCO SÃO GESTÕES DE REDES SOCIAIS ESTRATÉGICOS, NOSSA META É TRAZER MOVIMENTO DIRECIONADO PARA SUA MARCA COM PLANEJAMENTO E AÇÃO. ",
    "responsavel": "MARLLUS ",
    "cor": "",
    "tons": "Criativo | Descontraído | Profissional | Premium | Popular | Objetivo | Vendedor",
    "objetivos": "Vender mais | Atrair novos clientes | Fortalecer autoridade | Fidelizar clientes | Aumentar visitas ao perfil | Aumentar alcance",
    "linhas": "Educacional | Conexão | Institucional | Vendas | Relacionamento",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 2,
      "posts": 1,
      "stories": 1,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Stories",
        "titulo": "CP: SUA MARCA É LEMBRADA PELO QUÊ?",
        "ideia": "IDEIA: Story de relacionamento para estimular empresários a refletirem sobre o próprio posicionamento. O objetivo é gerar respostas e iniciar conversas comerciais com potenciais clientes.",
        "data": "2026-09-04"
      },
      {
        "tipo": "Post",
        "titulo": "CP: SUA MARCA PRECISA SER LEMBRADA ANTES DE SER NECESSÁRIA",
        "ideia": "IDEIA: Post de posicionamento para mostrar que o marketing constrói presença antes do momento da compra. O objetivo é gerar desejo por uma gestão estratégica e reforçar a importância da constância.",
        "data": "2026-09-03"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: SEU PRODUTO É BOM, MAS A IMAGEM NÃO MOSTRA ISSO",
        "ideia": "IDEIA: Reel comercial para divulgar os serviços de fotografia e produção audiovisual da Move. O objetivo é mostrar que uma apresentação visual profissional aumenta a percepção de qualidade e desperta mais desejo no público.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: POR QUE SEU CONCORRENTE PARECE MAIOR QUE SUA EMPRESA?",
        "ideia": "IDEIA: Reel educacional e provocativo para explicar que uma comunicação bem-posicionada aumenta a percepção de valor de uma empresa. O objetivo é gerar identificação, fortalecer a autoridade da Move e atrair empresários.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Post",
        "titulo": "CP: UM PERFIL BONITO CHAMA ATENÇÃO. UMA ESTRATÉGIA MOVIMENTA A MARCA.",
        "ideia": "IDEIA: Post de posicionamento para diferenciar estética de estratégia. O objetivo é mostrar que a Move não entrega apenas designs, mas constrói comunicação direcionada para gerar resultados.",
        "data": "2026-08-28"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: SUA MARCA NÃO PRECISA DE MAIS CONTEÚDO",
        "ideia": "IDEIA: Reel comercial com uma quebra de expectativa para apresentar o conceito central da agência: movimento direcionado. O objetivo é gerar curiosidade, visitas ao perfil e contatos de empresas interessadas em gestão estratégica.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: POSTAR NÃO É O MESMO QUE TER ESTRATÉGIA",
        "ideia": "IDEIA: Reel educacional e provocativo para mostrar que publicar por obrigação não gera posicionamento consistente. O objetivo é fortalecer a autoridade da Move e atrair empresários que precisam profissionalizar suas redes sociais.",
        "data": "2026-08-24"
      }
    ]
  },
  {
    "companyId": "47ac3040-cab2-4377-8aa7-b6853f88ef0e",
    "empresa": "VERDURÃO BAHIANO ",
    "sobre": "VERDURÃO BAHIANO É UM VERDURÃO EM URUCUI PIAUI, FRUTAS E VERDURAS E FRESQUINHAS, QUALIDADE E ECONOMIA PRA DONA DE CASA. QUARTA É O DIA QUE CHEGA NOVIDADES, FRUTAS E VERDURAS FRESCAS",
    "responsavel": "GIULITTE ",
    "cor": "#268b18",
    "tons": "Profissional | Humano | Próximo | Amigável | Objetivo | Persuasivo | Comercial | Vendedor",
    "objetivos": "Vender mais | Atrair novos clientes | Aumentar reconhecimento da marca | Criar conexão com o público | Aumentar visitas ao perfil",
    "linhas": "Educacional | Conexão | Oferta | Autoridade | Entretenimento | Vendas",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 1,
      "posts": 1,
      "stories": 0,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Post",
        "titulo": "CP: MONTE SUA SACOLA PERFEITA",
        "ideia": "IDEIA: Post de engajamento para incentivar o público a comentar seus produtos preferidos enquanto apresenta a variedade do Verdurão Bahiano. O objetivo é gerar interação, desejo e visitas à loja.",
        "data": "2026-09-09"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: O SOM MAIS FRESQUINHO DA QUARTA-FEIRA",
        "ideia": "IDEIA: Reel visual em estilo ASMR para transformar a chegada dos produtos em uma experiência que desperte desejo. O objetivo é aumentar o alcance e fazer o público associar imediatamente a quarta-feira ao Verdurão Bahiano.",
        "data": "2026-09-07"
      },
      {
        "tipo": "Post",
        "titulo": "CP: QUARTA-FEIRA É DIA DE RENOVAR A FEIRA",
        "ideia": "IDEIA: Post comercial para transformar a quarta-feira em uma data fixa na mente dos clientes. O objetivo é divulgar a chegada de frutas e verduras frescas, gerar desejo e aumentar o movimento na loja.",
        "data": "2026-09-02"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: ERA PARA COMPRAR SÓ UMA COISINHA",
        "ideia": "IDEIA: Reel de entretenimento baseado em uma situação comum: a pessoa entra para comprar apenas um produto e sai com a sacola cheia. O objetivo é gerar identificação, compartilhamentos e desejo pela variedade do Verduração Bahiano.",
        "data": "2026-08-31"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: O DESAFIO DAS 5 CORES NA CESTA",
        "ideia": "IDEIA: Criar um conteúdo visual, educativo e divertido que apresente a variedade do Verdurão Bahiano. O objetivo é aumentar o alcance, gerar comentários e estimular o público a montar uma feira mais colorida.",
        "data": "2026-08-26"
      },
      {
        "tipo": "Post",
        "titulo": "CP: MAIS COR NA MESA, MAIS ECONOMIA NA FEIRA",
        "ideia": "IDEIA: Destacar a variedade de frutas e verduras como uma forma de deixar as refeições da família mais coloridas e atrativas. O objetivo é divulgar os produtos, gerar desejo e estimular visitas ao Verdurão Bahiano.",
        "data": "2026-08-24"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: EU SÓ VIM COMPRAR UMA COISINHA…",
        "ideia": "IDEIA: Criar um Reel divertido e identificável mostrando que é difícil resistir à variedade de produtos frescos. O objetivo é gerar alcance, comentários e desejo de visitar o Verdurão Bahiano.",
        "data": "2026-08-20"
      },
      {
        "tipo": "Post",
        "titulo": "CP: QUARTA-FEIRA É DIA DE NOVIDADES FRESQUINHAS",
        "ideia": "IDEIA: Fixar a quarta-feira como o melhor dia para visitar o Verdurão Bahiano, destacando a chegada de frutas e verduras frescas. O objetivo é gerar movimento na loja, atrair novos clientes e aumentar as vendas.",
        "data": "2026-08-19"
      }
    ]
  },
  {
    "companyId": "a46781ed-4455-48ea-ad89-c714852d7916",
    "empresa": "MAURA CONFECÇÕES",
    "sobre": "LOJA MODA MASCULINA EM URUCUI PIAUI, CUSTO BENEFICIO, PRECO ACESSIVEL COM QUALIDADE NAS ROUPAS.... MODA MASCULINA + SEÇÃO DE MAQUIAGEM A PARTIR DE R$10,00 \n",
    "responsavel": "HIAGO ASTEFRAN ",
    "cor": "#000000",
    "tons": "Criativo | Profissional | Amigável | Comercial | Vendedor",
    "objetivos": "Vender mais | Gerar engajamento | Criar conexão com o público | Aumentar alcance | Gerar desejo | Educar o público",
    "linhas": "Educacional | Conexão | Oferta | Entretenimento | Prova social | Relacionamento",
    "diasPublicacao": "",
    "diaCaptacao": "Segunda",
    "reservaMinima": 1,
    "demandaSemanal": {
      "reels": 2,
      "posts": 0,
      "stories": 1,
      "captacoes": 0
    },
    "historicoRecente": [
      {
        "tipo": "Reels",
        "titulo": "CP: AMIGA, VOCÊ JÁ DECIDIU A MAQUIAGEM PARA O ANIVERSÁRIO DA CIDADE?",
        "ideia": "IDEIA: Reel direcionado às mulheres, mostrando que a produção para a comemoração também começa pela maquiagem. O objetivo é divulgar a nova seção, destacar os produtos a partir de R$10,00 e aumentar as vendas antes do sábado.",
        "data": "2026-09-04"
      },
      {
        "tipo": "Reels",
        "titulo": "CP: URUÇUÍ ESTÁ EM FESTA. E O SEU LOOK?",
        "ideia": "IDEIA: Reel comercial para aproveitar o aniversário de Uruçuí e apresentar as opções de moda masculina para quem quer sair bem-vestido nas comemorações. O objetivo é gerar desejo, visitas à loja e vendas durante a semana.",
        "data": "2026-09-03"
      }
    ]
  }
]

Retorne somente o JSON final válido.
