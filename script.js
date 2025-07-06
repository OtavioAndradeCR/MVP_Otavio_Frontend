const API_BASE_URL = 'http://localhost:5000/api';

// Estado da aplicação
let users = [];
let appointments = [];
let isBackendOnline = false;

// Variáveis para controle de edição
let editingUser = null;
let editingAppointment = null;

// --- Funções de Requisição à API (e fallback em memória) ---
async function apiRequest(method, endpoint, data = null) {
    showLoading();
    try {
        if (isBackendOnline) {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || `Erro na requisição: ${response.status}`);
            }
            return responseData;
        } else {
            // Fallback para operações em memória se o backend estiver offline
            return handleOfflineOperation(method, endpoint, data);
        }
    } catch (error) {
        console.error(`Erro na requisição ${method} ${endpoint}:`, error);
        showToast(`Erro: ${error.message}`, 'error');
        if (isBackendOnline) { // Se o erro ocorreu com o backend online, significa que ele caiu
            isBackendOnline = false;
            return handleOfflineOperation(method, endpoint, data);
        }
        throw error; // Re-lança o erro se já estivermos no modo offline
    } finally {
        hideLoading();
    }
}

function handleOfflineOperation(method, endpoint, data) {
    const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

    if (endpoint.startsWith('/users')) {
        const userIdMatch = endpoint.match(/\/users\/(\d+)/);
        const userId = userIdMatch ? parseInt(userIdMatch[1]) : null;

        switch (method) {
            case 'GET':
                return users;
            case 'POST':
                const newUser = { id: generateId(), ...data };
                users.push(newUser);
                showToast('Usuário criado', 'success');
                return newUser;
            case 'PUT':
                users = users.map(u => (u.id === userId ? { ...u, ...data } : u));
                showToast('Usuário atualizado', 'success');
                return users.find(u => u.id === userId);
            case 'DELETE':
                users = users.filter(u => u.id !== userId);
                appointments = appointments.filter(app => app.user_id !== userId);
                showToast('Usuário deletado', 'success');
                return { message: 'Deletado com sucesso' };
        }
    } else if (endpoint.startsWith('/appointments')) {
        const appointmentIdMatch = endpoint.match(/\/appointments\/(\d+)/);
        const appointmentId = appointmentIdMatch ? parseInt(appointmentIdMatch[1]) : null;

        switch (method) {
            case 'GET':
                return appointments;
            case 'POST':
                const newAppointment = { id: generateId(), ...data, date_time: new Date(data.date_time).toISOString(), status: 'agendado' }; // Adicionado status padrão
                appointments.push(newAppointment);
                showToast('Agendamento criado', 'success');
                return newAppointment;
            case 'PUT':
                appointments = appointments.map(app => (app.id === appointmentId ? { ...app, ...data, date_time: new Date(data.date_time).toISOString() } : app));
                showToast('Agendamento atualizado', 'success');
                return appointments.find(app => app.id === appointmentId);
            case 'DELETE':
                appointments = appointments.filter(app => app.id !== appointmentId);
                showToast('Agendamento deletado', 'success');
                return { message: 'Deletado com sucesso' };
        }
    }
    return null;
}

// --- Inicialização e Event Listeners ---
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    await checkBackendStatus();
    await loadData();
    updateDashboard();
    setupEventListeners();
    showSection('dashboard');
}

async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/`);
        isBackendOnline = response.ok;
    } catch (error) {
        isBackendOnline = false;
    }
}

async function loadData() {
    users = await apiRequest('GET', '/users/');
    appointments = await apiRequest('GET', '/appointments/');
}

function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showSection(this.dataset.section);
        });
    });

    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);
    document.getElementById('appointmentForm').addEventListener('submit', handleAppointmentSubmit);

    document.getElementById('addUserBtn').addEventListener('click', () => showUserForm(null));
    document.getElementById('cancelUserBtn').addEventListener('click', hideUserForm);
    document.getElementById('addAppointmentBtn').addEventListener('click', () => showAppointmentForm(null));
    document.getElementById('cancelAppointmentBtn').addEventListener('click', hideAppointmentForm);
}

// --- Funções de Navegação e Renderização ---
function showSection(sectionName) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionName).classList.add('active');

    if (sectionName === 'users') {
        renderUsers();
    } else if (sectionName === 'appointments') {
        renderAppointments();
        loadUsersForSelect();
    } else if (sectionName === 'dashboard') {
        updateDashboard();
    }
}

function renderUsers() {
    const usersList = document.getElementById('users-list');
    if (users.length === 0) {
        usersList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Nenhum usuário cadastrado</p>';
        return;
    }
    usersList.innerHTML = users.map(user => `
        <div class="data-item">
            <div class="data-item-content">
                <h4>${user.username}</h4>
                <p>${user.email}</p>
            </div>
            <div class="data-item-actions">
                <button class="btn btn-primary" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i> Deletar
                </button>
            </div>
        </div>
    `).join('');
}

function renderAppointments() {
    const appointmentsList = document.getElementById('appointments-list');
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Nenhum agendamento cadastrado</p>';
        return;
    }
    appointmentsList.innerHTML = appointments.map(appointment => {
        const user = users.find(u => u.id === appointment.user_id);
        const dateTime = new Date(appointment.date_time);
        return `
            <div class="data-item">
                <div class="data-item-content">
                    <h4>${appointment.title}</h4>
                    <p><strong>Usuário:</strong> ${user ? user.username : 'Usuário Removido'}</p>
                    <p><strong>Data:</strong> ${dateTime.toLocaleDateString('pt-BR')} às ${dateTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
                    <p><strong>Descrição:</strong> ${appointment.description || 'Sem descrição'}</p>
                    <span class="status-badge status-${appointment.status}">${appointment.status}</span>
                </div>
                <div class="data-item-actions">
                    <button class="btn btn-primary" onclick="editAppointment(${appointment.id})">
                        <i class="fas fa-edit"></i> Editar
                </button>
                    <button class="btn btn-danger" onclick="deleteAppointment(${appointment.id})">
                        <i class="fas fa-trash"></i> Deletar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function loadUsersForSelect() {
    const select = document.getElementById('appointment-user');
    select.innerHTML = '<option value="">Selecione um usuário</option>';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.username;
        select.appendChild(option);
    });
}

// --- Funções de Formulário ---
function showUserForm(user = null) {
    document.getElementById('user-form').style.display = 'block';
    document.getElementById('userForm').reset();
    document.getElementById('userFormTitle').textContent = user ? 'Editar Usuário' : 'Adicionar Novo Usuário';
    document.getElementById('userFormSubmitBtn').textContent = user ? 'Salvar Alterações' : 'Adicionar Usuário';
    editingUser = user;

    const passwordInput = document.getElementById('password');
    const passwordHint = document.getElementById('password-hint');

    if (user) {
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        passwordInput.value = '';
        passwordInput.required = false;
        passwordHint.style.display = 'inline';
    } else {
        passwordInput.required = true;
        passwordHint.style.display = 'none';
    }
}

function hideUserForm() {
    document.getElementById('user-form').style.display = 'none';
    editingUser = null;
}

function showAppointmentForm(appointment = null) {
    document.getElementById('appointment-form').style.display = 'block';
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentFormTitle').textContent = appointment ? 'Editar Agendamento' : 'Adicionar Novo Agendamento';
    document.getElementById('appointmentFormSubmitBtn').textContent = appointment ? 'Salvar Alterações' : 'Adicionar Agendamento';
    editingAppointment = appointment;
    loadUsersForSelect();

    if (appointment) {
        document.getElementById('appointment-user').value = appointment.user_id;
        document.getElementById('appointment-title').value = appointment.title;
        document.getElementById('appointment-description').value = appointment.description;
        const dateTime = new Date(appointment.date_time);
        const formattedDateTime = dateTime.toISOString().slice(0, 16);
        document.getElementById('appointment-date-time').value = formattedDateTime;
    }
}

function hideAppointmentForm() {
    document.getElementById('appointment-form').style.display = 'none';
    editingAppointment = null;
}

async function handleUserSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
    };

    if(!editingUser || formData.get('password')) {
        userData.password = formData.get('password');
    }

    if (editingUser) {
        await apiRequest('PUT', `/users/${editingUser.id}`, userData);
    } else {
        await apiRequest('POST', '/users/', userData);
    }
    hideUserForm();
    await loadData();
    renderUsers();
    updateDashboard();
}

async function handleAppointmentSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const appointmentData = {
        user_id: parseInt(formData.get('user_id')),
        title: formData.get('title'),
        description: formData.get('description'),
        date_time: formData.get('date_time')
    };

    if (appointmentData.date_time) {
        appointmentData.date_time = new Date(appointmentData.date_time).toISOString();
    }

    if (editingAppointment) {
        await apiRequest('PUT', `/appointments/${editingAppointment.id}`, appointmentData);
    } else {
        await apiRequest('POST', '/appointments/', appointmentData);
    }
    hideAppointmentForm();
    await loadData();
    renderAppointments();
    updateDashboard();
}

// --- Funções de Edição e Deleção ---
function editUser(userId) {
    const userToEdit = users.find(user => user.id === userId);
    if (userToEdit) {
        showUserForm(userToEdit);
    }
}

async function deleteUser(userId) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
        return;
    }
    await apiRequest('DELETE', `/users/${userId}`);
    await loadData();
    renderUsers();
    renderAppointments();
    updateDashboard();
}

function editAppointment(appointmentId) {
    const appointmentToEdit = appointments.find(app => app.id === appointmentId);
    if (appointmentToEdit) {
        showAppointmentForm(appointmentToEdit);
    }
}

async function deleteAppointment(appointmentId) {
    if (!confirm('Tem certeza que deseja deletar este agendamento?')) {
        return;
    }
    await apiRequest('DELETE', `/appointments/${appointmentId}`);
    await loadData();
    renderAppointments();
    updateDashboard();
}

// --- Dashboard ---
function updateDashboard() {
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('total-appointments').textContent = appointments.length;
    
    const pendingAppointments = appointments.filter(app => app.status === 'agendado').length;
    document.getElementById('pending-appointments').textContent = pendingAppointments;
}

// --- Utilitários ---
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}