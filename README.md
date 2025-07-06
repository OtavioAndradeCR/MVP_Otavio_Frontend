# Sistema de Agendamento e Gestão - Frontend

## Descrição do Projeto

Este é o frontend do Sistema de Agendamento e Gestão para Pequenos Negócios, desenvolvido como uma Single Page Application (SPA) utilizando HTML, CSS e JavaScript. A aplicação oferece uma interface moderna, responsiva e intuitiva para gerenciamento de usuários e agendamentos.

## Tecnologias Utilizadas

- **HTML5** - Estrutura semântica da aplicação
- **CSS3** - Estilização moderna e responsiva
- **JavaScript (ES6+)** - Lógica da aplicação e interação com API
- **Font Awesome** - Ícones vetoriais
- **Fetch API** - Comunicação com o backend
- **CSS Grid e Flexbox** - Layout responsivo

## Características do Design

### Design Moderno e Responsivo
- Interface limpa e profissional
- Gradientes e efeitos visuais modernos
- Animações suaves e micro-interações
- Totalmente responsivo para desktop e mobile

### Experiência do Usuário
- Navegação intuitiva por abas
- Formulários com validação
- Feedback visual através de toasts
- Loading states para melhor UX
- Hover effects e transições suaves

## Estrutura do Projeto

```
frontend/
├── index.html          # Página principal da aplicação
├── styles.css          # Estilos CSS da aplicação
├── script.js           # Lógica JavaScript da aplicação
└── README.md           # Este arquivo
```

## Instalação e Configuração

### Pré-requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)

### Passos para Execução

1. **Abra o arquivo index.html em um navegador:**
   - Opção 1: Duplo clique no arquivo `index.html`
   - Opção 2: Abra via navegador (File > Open)
   - Opção 3: Use um servidor local (recomendado para desenvolvimento)

## Funcionalidades Implementadas

### Dashboard
- Visão geral do sistema
- Contadores de usuários, agendamentos e pendências
- Cards informativos com ícones

### Gerenciamento de Usuários
- Listagem de todos os usuários cadastrados
- Formulário para cadastro de novos usuários
- Exclusão de usuários existentes
- Validação de formulários

### Gerenciamento de Agendamentos
- Listagem de todos os agendamentos
- Formulário para criação de novos agendamentos
- Seleção de usuário via dropdown
- Campos para título, descrição e data/hora
- Status visual dos agendamentos
- Exclusão de agendamentos

### Recursos de Interface
- Navegação por abas responsiva
- Formulários modais com animações
- Sistema de notificações (toasts)
- Loading overlay durante requisições
- Design responsivo para mobile

## Arquitetura da Aplicação

### Organização do Código JavaScript

```javascript
// Configuração
const API_BASE_URL = 'http://localhost:5000/api';

// Estado da aplicação
let users = [];
let appointments = [];

// Principais funções
- initializeApp()        // Inicialização
- setupEventListeners()  // Event listeners
- showSection()          // Navegação
- apiRequest()           // Comunicação com API
- loadUsers()            // Carregamento de usuários
- loadAppointments()     // Carregamento de agendamentos
- renderUsers()          // Renderização de usuários
- renderAppointments()   // Renderização de agendamentos
```

### Padrões de Design Utilizados

1. **Module Pattern** - Organização do código em módulos funcionais
2. **Observer Pattern** - Event listeners para interações
3. **MVC Pattern** - Separação de dados, visualização e controle
4. **Progressive Enhancement** - Funcionalidade básica sem JavaScript

## Recursos de CSS

### Layout Responsivo
```css
/* Grid responsivo */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

/* Media queries para mobile */
@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
}
```

### Animações e Transições
```css
/* Animação de entrada */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Hover effects */
.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}
```

### Sistema de Cores
- **Primária:** Gradiente azul-roxo (#4f46e5 → #7c3aed)
- **Secundária:** Tons de cinza (#f3f4f6, #6b7280)
- **Sucesso:** Verde (#10b981)
- **Erro:** Vermelho (#ef4444)
- **Background:** Gradiente (#667eea → #764ba2)

## Integração com Backend

### Comunicação com API
```javascript
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    
    return await response.json();
}
```

### Endpoints Utilizados
- `GET /api/users/` - Listar usuários
- `POST /api/users/` - Criar usuário
- `DELETE /api/users/{id}` - Deletar usuário
- `GET /api/appointments/` - Listar agendamentos
- `POST /api/appointments/` - Criar agendamento
- `DELETE /api/appointments/{id}` - Deletar agendamento

## Compatibilidade

### Navegadores Suportados
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Dispositivos
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Considerações de Performance

- CSS otimizado com seletores eficientes
- JavaScript modular e bem organizado
- Imagens otimizadas (ícones vetoriais)
- Carregamento assíncrono de dados
- Debounce em eventos quando necessário