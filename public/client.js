class DJMeshClient {
    constructor() {
        this.socket = null;
        this.posts = [];
        this.currentUser = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.currentPost = null;
        this.musicPlayer = new MusicPlayer(this); // Pasamos la referencia
        this.djMode = true;

        this.init();
    }

    init() {
        console.log('🚀 Iniciando DJMesh Client...');
        this.loadUser();
        this.setupEventListeners();
        this.connect();
        this.loadTheme();
        this.startVisualDecay();
        this.createDJFeatures();
        this.createDynamicBackground();
        this.createOnlineCounter(); // 🆕 Contador de usuarios online
        // 🎯 INICIALIZAR MUSIC PLAYER CON RETRASO PARA MÓVILES
        setTimeout(() => {
            this.musicPlayer.init();
            console.log('🎵 Music Player inicializado para móviles');
        }, 1500);
    }
    
    loadUser() {
        const savedNickname = localStorage.getItem('djmesh_nickname');
        if (savedNickname) {
            this.currentUser = savedNickname;
            this.hideNicknameModal();
        } else {
            this.showNicknameModal();
        }
    }
    
    showNicknameModal() {
        document.getElementById('nicknameModal').style.display = 'flex';
        document.getElementById('nicknameInput').focus();
    }
    
    hideNicknameModal() {
        document.getElementById('nicknameModal').style.display = 'none';
    }
    
    setupEventListeners() {
        console.log('📝 Configurando eventos...');

        // Nickname
        document.getElementById('saveNickname').addEventListener('click', () => this.saveUserNickname());
        document.getElementById('nicknameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveUserNickname();
        });

        // Comentarios
        document.getElementById('submitComment').addEventListener('click', () => this.addComment());
        document.getElementById('commentInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addComment();
        });

        // Cerrar modales
        document.getElementById('closeModal').addEventListener('click', () => this.closeCommentModal());
        document.getElementById('closePublishBtn').addEventListener('click', () => this.closePublishModal());

        // Publicar
        document.getElementById('publishBtn').addEventListener('click', () => this.openPublishModal());
        document.getElementById('submitPublish').addEventListener('click', () => this.createNewPost());
        document.getElementById('publishInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.createNewPost();
            }
        });

        // Cerrar modales al hacer click fuera
        document.getElementById('commentModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('commentModal')) this.closeCommentModal();
        });

        document.getElementById('publishModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('publishModal')) this.closePublishModal();
        });

        // Inbox
        document.getElementById('inboxBtn').addEventListener('click', () => this.openInboxModal());
        document.getElementById('closeInboxBtn').addEventListener('click', () => this.closeInboxModal());
        document.getElementById('inboxModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('inboxModal')) this.closeInboxModal();
        });

        // Tabs de inbox
        document.querySelectorAll('.inbox-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchInboxTab(e.target.getAttribute('data-tab')));
        });

        // Enviar mensaje
        document.getElementById('sendMessageBtn').addEventListener('click', () => this.sendMessage());

        // Reorganizar grid en resize
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.renderGrid(), 250);
        });

        console.log('✅ Eventos configurados');
    }

    createDJFeatures() {
        if (document.querySelector('.dj-panel')) return;

        const djPanel = document.createElement('div');
        djPanel.className = 'dj-panel';
        djPanel.innerHTML = `
            <h4>🎵 Herramientas para DJs</h4>
            <div class="dj-grid">
                <button class="dj-btn" data-type="mix">
                    <span class="icon">🎧</span>
                    <span class="label">Mixes</span>
                    <small>Comparte tus sets</small>
                </button>
                <button class="dj-btn" data-type="track">
                    <span class="icon">🎵</span>
                    <span class="label">Tracks</span>
                    <small>Nuevos descubrimientos</small>
                </button>
                <button class="dj-btn" data-type="collaboration">
                    <span class="icon">🤝</span>
                    <span class="label">Colaborar</span>
                    <small>Busco DJs</small>
                </button>
                <button class="dj-btn" data-type="event">
                    <span class="icon">📅</span>
                    <span class="label">Eventos</span>
                    <small>Fiestas y gigs</small>
                </button>
                <button class="dj-btn" data-type="equipment">
                    <span class="icon">🎚️</span>
                    <span class="label">Equipo</span>
                    <small>Compra/venta</small>
                </button>
                <button class="dj-btn" data-type="lookingfor">
                    <span class="icon">🔍</span>
                    <span class="label">Busco</span>
                    <small>Gigs o equipo</small>
                </button>
            </div>
        `;

        document.querySelector('.container').prepend(djPanel);

        // Event listeners para todos los botones
        document.querySelectorAll('.dj-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.getAttribute('data-type');
                this.openDJModal(type);
            });
        });
    }

    // 🆕 CREAR FONDO DINÁMICO
    createDynamicBackground() {
        if (document.getElementById('dynamicBackground')) return;
        
        const bg = document.createElement('div');
        bg.id = 'dynamicBackground';
        bg.className = 'dynamic-bg';
        document.body.appendChild(bg);
    }

    // 🆕 ACTUALIZAR FONDO SEGÚN CANCIÓN
    updateDynamicBackground(imageUrl) {
        const bg = document.getElementById('dynamicBackground');
        if (bg && imageUrl) {
            // 🎯 Verificar que la imagen exista antes de intentar cargarla
            const img = new Image();
            img.onload = () => {
                bg.style.backgroundImage = `url(${imageUrl})`;
                bg.style.opacity = '0.15';
            };
            img.onerror = () => {
                console.log('🖼️ Imagen de fondo no encontrada:', imageUrl);
                bg.style.backgroundImage = 'none';
            };
            img.src = imageUrl;
        }
    }

    // 🆕 CREAR CONTADOR DE USUARIOS ONLINE
    createOnlineCounter() {
        if (document.getElementById('onlineCounter')) return;

        const counter = document.createElement('div');
        counter.id = 'onlineCounter';
        counter.className = 'online-counter';
        counter.innerHTML = `
            <span class="online-icon">👥</span>
            <span class="online-count">0</span>
            <span class="online-label">online</span>
        `;
        document.body.appendChild(counter);

        console.log('👥 Contador de usuarios online creado');
    }

    // 🆕 ACTUALIZAR CONTADOR DE USUARIOS ONLINE
    updateOnlineCounter(count) {
        const counterEl = document.getElementById('onlineCounter');
        if (counterEl) {
            const countEl = counterEl.querySelector('.online-count');
            if (countEl) {
                countEl.textContent = count;
                // 🎯 Animación sutil cuando cambia
                countEl.style.animation = 'pulse 0.3s ease-in-out';
                setTimeout(() => {
                    countEl.style.animation = '';
                }, 300);
            }
        }
    }

    openDJModal(postType) {
        const configs = {
            mix: {
                title: '🎧 Compartir Mix',
                placeholder: 'Comparte tu mix:\n\n- Nombre del set\n- Género\n- Duración\n- Link o descripción\n\nEjemplo:\n"Mi set de techno de 2 horas para la fiesta de anoche"',
                prefix: '🎧 MIX:\n'
            },
            track: {
                title: '🎵 Nuevo Track',
                placeholder: 'Comparte un track nuevo:\n\n- Artista\n- Título\n- Género\n- ¿Dónde escucharlo?\n\nEjemplo:\n"Track nuevo de Daft Punk - One More Time"',
                prefix: '🎵 TRACK:\n'
            },
            collaboration: {
                title: '🤝 Busco Colaboración',
                placeholder: '¿Qué necesitas?\n\nEjemplos:\n- "DJ para fiesta techno"\n- "Productor para remix"\n- "Cantante para track"\n- "Fotógrafo para evento"',
                prefix: '🤝 COLABORACIÓN:\n'
            },
            event: {
                title: '📅 Compartir Evento',
                placeholder: 'Detalles del evento:\n\nFecha: [fecha]\nHora: [hora]\nLugar: [lugar]\nEstilo: [género]\n\nDescripción...',
                prefix: '📅 EVENTO:\n'
            },
            equipment: {
                title: '🎚️ Equipo DJ',
                placeholder: '¿Qué ofreces o buscas?\n\nEjemplos:\n- "Vendo Pioneer CDJ-2000"\n- "Busco controladores MIDI"\n- "Interesado en monitores KRK"',
                prefix: '🎚️ EQUIPO:\n'
            },
            lookingfor: {
                title: '🔍 Estoy Buscando',
                placeholder: '¿Qué necesitas encontrar?\n\nEjemplos:\n- "Gigs para fin de semana"\n- "Estudio de grabación"\n- "Cursos de producción"\n- "Manager o booking"',
                prefix: '🔍 BUSCO:\n'
            }
        };

        const config = configs[postType];
        const content = prompt(config.title + '\n\n' + config.placeholder);

        if (content) {
            this.sendPost(config.prefix + content, 'dj');
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('djmesh_theme');
        if (savedTheme === 'night') {
            document.body.classList.add('night-mode');
        }
        this.createThemeToggle();
    }

    createThemeToggle() {
        if (document.querySelector('.theme-toggle')) return;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = document.body.classList.contains('night-mode') ? '☀️' : '🌙';
        toggleBtn.className = 'theme-toggle';
        toggleBtn.title = 'Cambiar tema';
        toggleBtn.onclick = () => this.toggleTheme();
        document.body.appendChild(toggleBtn);
    }

    toggleTheme() {
        document.body.classList.toggle('night-mode');
        const isNightMode = document.body.classList.contains('night-mode');
        localStorage.setItem('djmesh_theme', isNightMode ? 'night' : 'day');

        const toggleBtn = document.querySelector('.theme-toggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = isNightMode ? '☀️' : '🌙';
        }
    }
    
    saveUserNickname() {
        const nickname = document.getElementById('nicknameInput').value.trim();
        if (nickname && nickname.length >= 2) {
            this.currentUser = nickname;
            localStorage.setItem('djmesh_nickname', nickname);
            this.hideNicknameModal();
            this.connect();
        } else {
            alert('¡Escribe un nickname de al menos 2 caracteres!');
            document.getElementById('nicknameInput').focus();
        }
    }
    
    connect() {
        try {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const protocol = isLocal ? 'ws:' : 'wss:';
            const wsUrl = isLocal 
                ? `${protocol}//${window.location.hostname}:${window.location.port || 10000}`
                : `${protocol}//${window.location.host}`;
            
            console.log(`🔗 Conectando a: ${wsUrl}`);
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('✅ Conectado al DJMesh');
                this.reconnectAttempts = 0;
                this.updateStatus('Conectado 🌐');
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };
            
            this.socket.onclose = () => {
                console.log('❌ Conexión cerrada');
                this.handleReconnection();
            };
            
            this.socket.onerror = (error) => {
                console.error('💥 Error de conexión:', error);
                this.updateStatus('Error de conexión 💥');
            };
            
        } catch (error) {
            console.error('❌ Error conectando:', error);
        }
    }
    
    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * this.reconnectAttempts, 10000);
            
            this.updateStatus(`Reconectando en ${delay/1000}s...`);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            this.updateStatus('Error de conexión ❌');
        }
    }
    
    handleMessage(data) {
        switch(data.type) {
            case 'welcome':
                console.log('👋', data.message);
                this.posts = data.posts || [];
                // 🎯 CRÍTICO: Pasar la playlist al music player
                if (data.dailyPlaylist) {
                    console.log('🎵 Recibiendo playlist del servidor:', data.dailyPlaylist.length, 'canciones');
                    this.musicPlayer.syncPlaylist(data.dailyPlaylist);
                }
                // 🆕 Actualizar contador de usuarios online
                if (data.onlineUsers !== undefined) {
                    this.updateOnlineCounter(data.onlineUsers);
                }
                this.renderGrid();
                break;

            case 'new_post':
                this.posts.unshift(data.post);
                this.renderGrid();
                this.highlightNewPost(data.post.id);
                break;

            case 'comment_added':
                this.handleNewComment(data);
                break;

            case 'error':
                alert(`Error: ${data.message}`);
                break;

            // 🆕 Post removido (resuelto)
            case 'post_removed':
                this.posts = this.posts.filter(p => p.id !== data.postId);
                this.renderGrid();
                break;

            // 🆕 Posts cargados desde persistencia
            case 'posts_loaded':
                console.log('📥 Posts persistentes cargados:', data.posts.length);
                // Agregar posts persistentes al inicio
                data.posts.forEach(post => {
                    if (!this.posts.find(p => p.id === post.id)) {
                        this.posts.unshift(post);
                    }
                });
                this.renderGrid();
                break;

            // 🆕 Actualización del contador de usuarios online
            case 'online_users_count':
                this.updateOnlineCounter(data.count);
                break;

            // 🆕 Manejar mensajes de inbox
            case 'messages_list':
                this.displayMessages(data.messages);
                break;

            case 'new_message':
                this.handleNewMessage(data.message);
                break;

            case 'message_sent':
                alert('Mensaje enviado correctamente!');
                break;

            case 'message_error':
                alert('Error al enviar mensaje: ' + data.message);
                break;
        }
    }
    
    handleNewComment(data) {
        const post = this.posts.find(p => p.id === data.postId);
        if (post) {
            post.comments.push(data.comment);
            post.interactions = data.newInteractions;
            
            if (this.currentPost && this.currentPost.id === data.postId) {
                this.addCommentToDOM(data.comment);
            }
            
            this.renderGrid();
        }
    }
    
    renderGrid() {
        const gridContainer = document.getElementById('gridContainer');
        if (!gridContainer) return;
        
        gridContainer.innerHTML = '';

        if (this.posts.length === 0) {
            gridContainer.innerHTML = `
                <div class="loading">
                    <h3>¡Bienvenido a DJMesh! 🎵</h3>
                    <p>Sé el primero en publicar haciendo doble click en cualquier lugar</p>
                    <p>O usa el botón naranja en la esquina inferior derecha</p>
                </div>
            `;
            return;
        }
        
        const sortedPosts = [...this.posts].sort((a, b) => b.interactions - a.interactions);
        const columnCount = Math.min(4, Math.max(2, Math.floor(window.innerWidth / 300)));
        const columns = Array.from({ length: columnCount }, () => []);
        
        sortedPosts.forEach((post, index) => {
            columns[index % columnCount].push(post);
        });
        
        columns.forEach(columnPosts => {
            const column = document.createElement('div');
            column.className = 'masonry-column';
            
            columnPosts.forEach(post => {
                const cell = this.createPostCell(post);
                column.appendChild(cell);
            });
            
            gridContainer.appendChild(column);
        });

        setTimeout(() => {
            this.setupReactionEvents();
            this.setupResolveButtons();
        }, 100);
    }
    
    createPostCell(post) {
        const cell = document.createElement('div');
        
        // Tamaño inteligente basado en interacciones + contenido
        let sizeClass = this.calculatePostSize(post);
        
        cell.className = `post-cell ${sizeClass}`;
        cell.style.animationDelay = `${Math.random() * 4}s`;
        
        // 🎯 Indicador visual del tipo de contenido
        const typeIndicator = this.getTypeIndicator(post);
        const userAvatar = this.getUserAvatar(post.user);
        
        cell.innerHTML = `
            <div class="interaction-count">${post.interactions} 💫</div>
            ${typeIndicator}
            <div class="user-avatar">${userAvatar}</div>
            <div class="user-name">${post.user}</div>
            <div class="post-content">${post.content}</div>
            ${this.addQuickReactions(post)}
            ${this.addResolveButton(post)}
        `;
        
        cell.addEventListener('click', () => this.openPostModal(post));
        
        // 🎯 Efectos especiales para posts populares
        this.applySpecialEffects(cell, post);
        
        return cell;
    }

    // 🆕 AÑADIR BOTÓN DE RESOLUCIÓN PARA COLABORACIONES Y BÚSQUEDAS
    addResolveButton(post) {
        const isCollaboration = post.content.includes('🤝 COLABORACIÓN:') || post.content.includes('🔍 BUSCO:');
        const isAuthor = post.user === this.currentUser;
        
        if (isCollaboration && isAuthor && !post.isResolved) {
            return `
                <button class="resolve-btn" onclick="window.djmeshApp.resolvePost('${post.id}')"
                        title="Marcar como resuelto">
                    ✅ Resuelto
                </button>
            `;
        }
        return '';
    }

    // 🆕 CONFIGURAR BOTONES DE RESOLUCIÓN
    setupResolveButtons() {
        document.querySelectorAll('.resolve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = e.target.closest('.post-cell').querySelector('.quick-reactions').getAttribute('data-postid');
                this.resolvePost(postId);
            });
        });
    }

    // 🆕 RESOLVER POST (marcar como completado)
    resolvePost(postId) {
        if (!confirm('¿Estás seguro de que quieres marcar este post como resuelto? Esto lo eliminará de la vista.')) {
            return;
        }

        fetch(`/resolve-post/${postId}`, {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                console.log('✅ Post marcado como resuelto');
            } else {
                alert('Error al marcar el post como resuelto');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión');
        });
    }

    // 🆕 ABRIR MODAL DE INBOX
    openInboxModal() {
        document.getElementById('inboxModal').style.display = 'flex';
        this.loadMessages();
    }

    // 🆕 CERRAR MODAL DE INBOX
    closeInboxModal() {
        document.getElementById('inboxModal').style.display = 'none';
        // Limpiar contenido
        document.getElementById('inboxMessages').innerHTML = '';
        document.getElementById('composeMessage').style.display = 'none';
        document.getElementById('inboxMessages').style.display = 'block';
    }

    // 🆕 CAMBIAR ENTRE TABS DE INBOX
    switchInboxTab(tab) {
        // Actualizar tabs
        document.querySelectorAll('.inbox-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Mostrar contenido correspondiente
        if (tab === 'inbox') {
            document.getElementById('inboxMessages').style.display = 'block';
            document.getElementById('composeMessage').style.display = 'none';
            this.loadMessages();
        } else {
            document.getElementById('inboxMessages').style.display = 'none';
            document.getElementById('composeMessage').style.display = 'block';
        }
    }

    // 🆕 CARGAR MENSAJES
    loadMessages() {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'get_messages',
                user: this.currentUser
            }));
        }
    }

    // 🆕 ENVIAR MENSAJE
    sendMessage() {
        const recipient = document.getElementById('recipientInput').value.trim();
        const subject = document.getElementById('subjectInput').value.trim();
        const content = document.getElementById('messageInput').value.trim();

        if (!recipient || !subject || !content) {
            alert('Completa todos los campos');
            return;
        }

        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'send_message',
                from: this.currentUser,
                to: recipient,
                subject: subject,
                content: content
            }));

            // Limpiar formulario
            document.getElementById('recipientInput').value = '';
            document.getElementById('subjectInput').value = '';
            document.getElementById('messageInput').value = '';

            alert('Mensaje enviado!');
        }
    }

    // 🆕 MOSTRAR MENSAJES EN LA INTERFAZ
    displayMessages(messages) {
        const messagesContainer = document.getElementById('inboxMessages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';

        if (messages.length === 0) {
            messagesContainer.innerHTML = '<div class="loading">No tienes mensajes</div>';
            return;
        }

        messages.forEach(message => {
            const messageItem = document.createElement('div');
            messageItem.className = `message-item ${message.read ? '' : 'unread'}`;
            messageItem.innerHTML = `
                <div class="message-subject">${message.subject}</div>
                <div class="message-from">De: ${message.from}</div>
                <div class="message-preview">${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}</div>
                <div class="message-timestamp">${new Date(message.timestamp).toLocaleString()}</div>
            `;

            messageItem.addEventListener('click', () => {
                this.showMessageDetails(message);
            });

            messagesContainer.appendChild(messageItem);
        });
    }

    // 🆕 MOSTRAR DETALLES DEL MENSAJE
    showMessageDetails(message) {
        // Marcar como leído si no lo está
        if (!message.read) {
            this.markMessageAsRead(message.id);
        }

        // Mostrar modal con detalles
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn" onclick="this.closest('.modal').remove()">&times;</span>
                <h3>${message.subject}</h3>
                <div class="message-details">
                    <p><strong>De:</strong> ${message.from}</p>
                    <p><strong>Fecha:</strong> ${new Date(message.timestamp).toLocaleString()}</p>
                    <hr>
                    <div class="message-content">${message.content.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    // 🆕 MARCAR MENSAJE COMO LEÍDO
    markMessageAsRead(messageId) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'mark_message_read',
                messageId: messageId
            }));
        }
    }

    // 🆕 MANEJAR NUEVO MENSAJE RECIBIDO
    handleNewMessage(message) {
        // Mostrar notificación
        this.showNotification(`Nuevo mensaje de ${message.from}: ${message.subject}`);

        // Recargar mensajes si el inbox está abierto
        if (document.getElementById('inboxModal').style.display === 'flex') {
            this.loadMessages();
        }
    }

    // 🆕 MOSTRAR NOTIFICACIÓN
    showNotification(message) {
        // Crear notificación flotante
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 255, 0.9);
            color: black;
            padding: 10px 20px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // 🎵 Calcular tamaño inteligente
    calculatePostSize(post) {
        const baseInteractions = post.interactions;
        const contentLength = post.content.length;
        
        // 🎯 Posts importantes son más grandes por defecto
        let importanceBonus = 0;
        if (this.isImportantPost(post)) {
            importanceBonus = 5;
        }
        
        let sizeScore = baseInteractions + (contentLength / 100) + importanceBonus;
        
        if (sizeScore >= 20) return 'xlarge';
        if (sizeScore >= 15) return 'large';
        if (sizeScore >= 8) return 'medium';
        return 'small';
    }

    // 🎵 Identificar posts importantes
    isImportantPost(post) {
        return post.content.includes('🤝 COLABORACIÓN:') ||
               post.content.includes('🔍 BUSCO:') || 
               post.content.includes('💿 PROYECTO:') ||
               post.content.includes('📅 EVENTO:');
    }

    // 🎵 Indicador del tipo de contenido
    getTypeIndicator(post) {
        if (post.content.includes('🎵 LETRAS:')) {
            return '<div class="post-type-badge lyrics-badge">📝 Letras</div>';
        }
        if (post.content.includes('🎸 ACORDES:')) {
            return '<div class="post-type-badge chords-badge">🎸 Acordes</div>';
        }
        if (post.content.includes('🤝 COLABORACIÓN:')) {
            return '<div class="post-type-badge collab-badge">🤝 Colaboración</div>';
        }
        if (post.content.includes('📅 EVENTO:')) {
            return '<div class="post-type-badge event-badge">📅 Evento</div>';
        }
        if (post.content.includes('💿 PROYECTO:')) {
            return '<div class="post-type-badge project-badge">💿 Proyecto</div>';
        }
        if (post.content.includes('🔍 BUSCO:')) {
            return '<div class="post-type-badge search-badge">🔍 Busco</div>';
        }
        return '';
    }

    // 🎵 Efectos especiales tipo Bejeweled
    applySpecialEffects(cell, post) {
        // Efecto de glow para posts muy populares
        if (post.interactions >= 15) {
            cell.classList.add('popular-glow');
        }
        
        // Efecto de "combo" para múltiples posts del mismo usuario
        const userPosts = this.posts.filter(p => p.user === post.user);
        if (userPosts.length >= 3) {
            cell.classList.add('combo-effect');
        }
        
        // Efecto especial para posts de compositores
        if (post.content.includes('🎵') || post.content.includes('🎸')) {
            cell.classList.add('composer-post');
        }
    }
    
    addQuickReactions(post) {
        const reactions = ['🔥', '❤️', '😂', '🎉', '👀', '💫'];
        const reactionsHTML = reactions.map(reaction => 
            `<span class="reaction" data-reaction="${reaction}">${reaction}</span>`
        ).join('');
    
        return `
            <div class="quick-reactions" data-postid="${post.id}">
                ${reactionsHTML}
            </div>
        `;
    }

    setupReactionEvents() {
        const reactionElements = document.querySelectorAll('.reaction');
    
        reactionElements.forEach(reactionEl => {
            const newReactionEl = reactionEl.cloneNode(true);
            reactionEl.parentNode.replaceChild(newReactionEl, reactionEl);
        
            newReactionEl.addEventListener('click', (event) => {
                event.stopPropagation();
                const reaction = newReactionEl.getAttribute('data-reaction');
                const postId = newReactionEl.closest('.quick-reactions').getAttribute('data-postid');
            
                console.log('🎯 Enviando reacción:', reaction, 'para post:', postId);
                this.sendReaction(postId, reaction);
            });
        });
    }

    sendReaction(postId, reaction) {
        console.log('🚀 Enviando reacción:', { 
            postId: postId, 
            tipo: typeof postId,
            reaction: reaction 
        });
    
        const postIdStr = String(postId);
    
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'new_comment',
                postId: postIdStr,
                user: this.currentUser,
                text: reaction
            }));
            console.log('✅ Reacción enviada con ID:', postIdStr);
        } else {
            console.error('❌ WebSocket no conectado');
        }
    }
    
    getUserAvatar(username) {
        const emojis = ['🐱', '🚀', '🌟', '🎮', '🌈', '🐶', '🎨', '⚡', '🌙', '🎵', '🔥', '🍕', '👾', '🦄', '🐙', '👻'];
        const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % emojis.length;
        return emojis[index];
    }
    
    openPostModal(post) {
        this.currentPost = post;
        document.getElementById('postTitle').textContent = `Comentarios de ${post.user}`;
        document.getElementById('postContent').textContent = post.content;
        
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = '';
        post.comments.forEach(comment => {
            this.addCommentToDOM(comment);
        });
        
        document.getElementById('commentModal').style.display = 'flex';
        document.getElementById('commentInput').focus();
    }
    
    addCommentToDOM(comment) {
        const commentsList = document.getElementById('commentsList');
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        commentItem.textContent = `${comment.user}: ${comment.text}`;
        commentsList.appendChild(commentItem);
        
        commentsList.scrollTop = commentsList.scrollHeight;
    }
    
    closeCommentModal() {
        document.getElementById('commentModal').style.display = 'none';
        document.getElementById('commentInput').value = '';
        this.currentPost = null;
    }
    
    openPublishModal() {
        document.getElementById('publishModal').style.display = 'flex';
        document.getElementById('publishInput').focus();
    }
    
    closePublishModal() {
        document.getElementById('publishModal').style.display = 'none';
        document.getElementById('publishInput').value = '';
    }
    
    createNewPost() {
        const content = document.getElementById('publishInput').value.trim();
        
        if (!content) {
            alert('¡Escribe algo para publicar!');
            return;
        }
        
        if (this.sendPost(content)) {
            this.closePublishModal();
        } else {
            alert('No conectado al servidor. Intenta recargar.');
        }
    }
    
    addComment() {
        const commentText = document.getElementById('commentInput').value.trim();
        
        if (!commentText || !this.currentPost) {
            alert('¡Escribe algo chido!');
            return;
        }
        
        if (this.sendComment(this.currentPost.id, commentText)) {
            document.getElementById('commentInput').value = '';
            document.getElementById('commentInput').focus();
            
            const submitComment = document.getElementById('submitComment');
            submitComment.textContent = '¡Comentado! ✓';
            setTimeout(() => {
                submitComment.textContent = 'Comentar';
            }, 1000);
        } else {
            alert('Error al enviar comentario');
        }
    }
    
    sendPost(content, postType = 'general') {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'new_post',
                user: this.currentUser,
                content: content,
                postType: postType
            }));
            return true;
        }
        return false;
    }
    
    sendComment(postId, text) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'new_comment',
                postId: postId,
                user: this.currentUser,
                text: text
            }));
            return true;
        }
        return false;
    }
    
    updateStatus(message) {
        let statusEl = document.getElementById('connectionStatus');
        if (!statusEl) {
            statusEl = this.createStatusElement();
        }
        statusEl.textContent = message;
    }
    
    createStatusElement() {
        const statusEl = document.createElement('div');
        statusEl.id = 'connectionStatus';
        statusEl.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 10px;
            font-size: 12px;
            z-index: 10000;
        `;
        document.body.appendChild(statusEl);
        return statusEl;
    }
    
    highlightNewPost(postId) {
        const cells = document.querySelectorAll('.post-cell');
        cells.forEach(cell => {
            if (cell.querySelector('.user-name')?.textContent === this.currentUser) {
                cell.style.animation = 'pulse 0.5s ease-in-out';
                setTimeout(() => {
                    cell.style.animation = '';
                }, 500);
            }
        });
    }

    startVisualDecay() {
        setInterval(() => {
            this.applyVisualDecay();
        }, 30000);
    }

    applyVisualDecay() {
        let hasChanges = false;
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        this.posts.forEach(post => {
            const hoursOld = (now - post.timestamp) / oneHour;
            
            // 🎯 Posts importantes decaen más lento
            const decayRate = this.isImportantPost(post) ? 0.3 : 1;
            
            if (hoursOld > 2 && post.interactions > 0) {
                const decay = Math.floor((hoursOld / 6) * decayRate);
                post.interactions = Math.max(0, post.interactions - decay);
                hasChanges = true;
            }
        });

        if (hasChanges) {
            this.renderGrid();
        }
    }
}

// 🎵 REPRODUCTOR DE AUDIO COMPATIBLE CON MÓVILES - MEJORADO PARA BRAVE
class MusicPlayer {
    constructor(djmeshClient) {
        this.djmeshClient = djmeshClient;
        this.tracks = [];
        this.currentTrackIndex = 0;
        this.audio = new Audio();
        this.isPlaying = false;
        this.trackStartTime = 0;
        this.currentTrackName = '';
        this.playlist = [];
        this.userInteracted = false; // 🆕 Para controlar interacción del usuario
        this.audioLoaded = false; // 🆕 Para saber si el audio está listo
        this.audioContext = null; // 🆕 Para navegadores que requieren AudioContext
        
        // 🎯 Configurar audio para máxima compatibilidad
        this.audio.preload = 'auto';
        this.audio.crossOrigin = 'anonymous';
        this.audio.volume = 0.8; // 🆕 Volumen por defecto
        
        console.log('🎵 Music Player inicializado - listo para móviles');
    }

    init() {
        console.log('🎵 Inicializando Music Player para móviles...');
        this.createPlayerUI();
        this.setupAudioEvents();
        
        // 🎯 Cargar playlist por defecto si no hay del servidor
        if (this.playlist.length === 0) {
            this.loadDefaultPlaylist();
        }
    }

    // 🎯 SINCRONIZAR CON PLAYLIST DEL SERVIDOR
    syncPlaylist(serverPlaylist) {
        console.log('🎵 Sincronizando playlist con servidor:', serverPlaylist);
        this.playlist = serverPlaylist;
        
        // Actualizar UI con la primera canción
        if (this.playlist.length > 0) {
            this.currentTrackIndex = 0;
            this.updatePlayerUI();
        }
    }

    // 🎯 PLAYLIST POR DEFECTO
    loadDefaultPlaylist() {
        this.playlist = [
            { 
                name: "🎵 4 - dR.iAn", 
                file: "/Music/track1.mp3",
                image: "/Music/track1.jpg"
            },
            { 
                name: "🎵 Me Reconozco - Rodrigo Escamilla", 
                file: "/Music/mereconozco.mp3",
                image: "/Music/mereconozco.jpg"
            },
            {   
                name: "🎵 Toda La Noche - Mariu", 
                file: "/Music/mariutodalanoche.mp3",
                image: "/Music/mariutodalanoche.jpg"
            },
            {   
                name: "🎵 A Contratiempo - Demian Cobo ft. Daniel Tejeda", 
                file: "/Music/acontratiempo.mp3",
                image: "/Music/acontratiempo.jpg"
            }
        ];
        console.log('🎵 Playlist por defecto cargada');
    }

    createPlayerUI() {
        // Evitar duplicados
        if (document.getElementById('musicToggle')) return;

        const playerHTML = `
            <div class="music-player" id="musicPlayerContainer">
                <button id="musicToggle" class="music-toggle-btn">🎵</button>
                <div class="player-info">
                    <span id="nowPlaying">DJMesh - Música Compartida</span>
                    <div class="player-controls">
                        <button id="prevTrack" class="control-btn">⏮️</button>
                        <button id="nextTrack" class="control-btn">⏭️</button>
                    </div>
                </div>
                <!-- 🆕 VISUALIZADOR DE AUDIO ESTILO WINAMP -->
                <div class="audio-visualizer">
                    <canvas id="waveformCanvas" width="200" height="60"></canvas>
                    <div class="audio-levels">
                        <div class="level-bar left">
                            <div class="level-fill" id="leftLevel"></div>
                        </div>
                        <div class="level-bar right">
                            <div class="level-fill" id="rightLevel"></div>
                        </div>
                    </div>
                </div>
                <!-- 🆕 MENSAJE MEJORADO PARA MÓVILES -->
                <div id="mobileHelp" class="mobile-help" style="display: none;">
                    👆 Toca para activar la música
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', playerHTML);

        // 🎯 CONFIGURAR EVENT LISTENERS ESPECIALES PARA MÓVILES
        this.setupMobileEvents();

        // 🆕 INICIALIZAR VISUALIZADOR DE AUDIO
        this.initAudioVisualizer();

        console.log('🎵 UI del Music Player creada con visualizador estilo Winamp');
    }

    // 🆕 INICIALIZAR VISUALIZADOR DE AUDIO ESTILO WINAMP
    initAudioVisualizer() {
        this.canvas = document.getElementById('waveformCanvas');
        if (!this.canvas) return;

        this.canvasContext = this.canvas.getContext('2d');
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;

        // 🆕 CONFIGURAR WEB AUDIO API PARA VISUALIZACIÓN
        this.setupAudioContext();

        // 🆕 INICIAR ANIMACIÓN DEL VISUALIZADOR
        this.startVisualization();

        console.log('🎵 Visualizador de audio Winamp inicializado');
    }

    // 🆕 CONFIGURAR WEB AUDIO API
    setupAudioContext() {
        try {
            // Crear AudioContext si no existe
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Crear analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            // Conectar audio al analyser
            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyser);
            source.connect(this.audioContext.destination);

            // Crear buffer para datos de frecuencia
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            console.log('🎵 Web Audio API configurada para visualización');
        } catch (error) {
            console.error('❌ Error configurando Web Audio API:', error);
        }
    }

    // 🆕 INICIAR ANIMACIÓN DEL VISUALIZADOR
    startVisualization() {
        const draw = () => {
            if (!this.analyser || !this.canvasContext) return;

            this.animationId = requestAnimationFrame(draw);

            // Obtener datos de frecuencia
            this.analyser.getByteFrequencyData(this.dataArray);

            // Limpiar canvas
            this.canvasContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Dibujar waveform estilo Winamp
            this.drawWaveform();

            // Actualizar barras de nivel
            this.updateLevelBars();
        };

        draw();
    }

    // 🆕 DIBUJAR WAVEFORM ESTILO WINAMP
    drawWaveform() {
        const canvas = this.canvas;
        const ctx = this.canvasContext;
        const width = canvas.width;
        const height = canvas.height;

        // Estilo Winamp: barras verticales con gradiente
        const barWidth = width / this.dataArray.length * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < this.dataArray.length; i++) {
            barHeight = (this.dataArray[i] / 255) * height;

            // Gradiente de colores estilo Winamp (verde a rojo)
            const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, '#00ff00'); // Verde
            gradient.addColorStop(0.5, '#ffff00'); // Amarillo
            gradient.addColorStop(1, '#ff0000'); // Rojo

            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    // 🆕 ACTUALIZAR BARRAS DE NIVEL DE AUDIO
    updateLevelBars() {
        if (!this.dataArray) return;

        // Calcular niveles izquierdo y derecho (simulado)
        let leftLevel = 0;
        let rightLevel = 0;

        // Simular separación estéreo dividiendo el array
        const midPoint = Math.floor(this.dataArray.length / 2);

        for (let i = 0; i < midPoint; i++) {
            leftLevel = Math.max(leftLevel, this.dataArray[i]);
            rightLevel = Math.max(rightLevel, this.dataArray[i + midPoint]);
        }

        // Convertir a porcentaje
        leftLevel = (leftLevel / 255) * 100;
        rightLevel = (rightLevel / 255) * 100;

        // Actualizar barras visuales
        const leftBar = document.getElementById('leftLevel');
        const rightBar = document.getElementById('rightLevel');

        if (leftBar) {
            leftBar.style.height = `${leftLevel}%`;
            leftBar.style.backgroundColor = leftLevel > 80 ? '#ff0000' : leftLevel > 60 ? '#ffff00' : '#00ff00';
        }

        if (rightBar) {
            rightBar.style.height = `${rightLevel}%`;
            rightBar.style.backgroundColor = rightLevel > 80 ? '#ff0000' : rightLevel > 60 ? '#ffff00' : '#00ff00';
        }
    }

    // 🆕 CONFIGURACIÓN ESPECIAL PARA MÓVILES
    setupMobileEvents() {
        const musicToggle = document.getElementById('musicToggle');
        const prevTrack = document.getElementById('prevTrack');
        const nextTrack = document.getElementById('nextTrack');
        const playerContainer = document.getElementById('musicPlayerContainer');

        // 🎯 DETECTAR SI ES MÓVIL
        const isMobile = this.isMobileDevice();

        // 🎯 EVENTO PRINCIPAL - Manejar primera interacción
        const handleFirstInteraction = () => {
            if (!this.userInteracted) {
                console.log('📱 Primera interacción del usuario en móvil');
                this.userInteracted = true;
                this.hideMobileHelp();
                
                // 🎯 En móviles, precargar el audio en la primera interacción
                this.preloadCurrentTrack();
                
                // 🆕 INTENTAR REPRODUCIR AUTOMÁTICAMENTE SI ESTÁ EN MÓVIL Y EL USUARIO INTERACTUÓ
                if (isMobile) {
                    this.playCurrentTrack();
                }
            }
        };

        // 🎯 AGREGAR EVENTOS TÁCTILES PARA MÓVILES
        if (isMobile) {
            // Mostrar ayuda para móviles
            this.showMobileHelp();
            
            // Agregar eventos táctiles
            musicToggle.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleFirstInteraction();
                this.togglePlay();
            }, { passive: false });

            prevTrack.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleFirstInteraction();
                this.prevTrack();
            }, { passive: false });

            nextTrack.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleFirstInteraction();
                this.nextTrack();
            }, { passive: false });

            // 🎯 Tocar cualquier parte del player cuenta como interacción
            playerContainer.addEventListener('touchstart', (e) => {
                if (!this.userInteracted) {
                    e.preventDefault();
                    handleFirstInteraction();
                }
            }, { passive: false });

        } else {
            // 🎯 EVENTOS NORMALES PARA DESKTOP
            musicToggle.addEventListener('click', () => {
                handleFirstInteraction();
                this.togglePlay();
            });

            prevTrack.addEventListener('click', () => {
                handleFirstInteraction();
                this.prevTrack();
            });

            nextTrack.addEventListener('click', () => {
                handleFirstInteraction();
                this.nextTrack();
            });
        }
    }

    // 🆕 DETECTAR DISPOSITIVO MÓVIL
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 🆕 MOSTRAR AYUDA PARA MÓVILES
    showMobileHelp() {
        const mobileHelp = document.getElementById('mobileHelp');
        if (mobileHelp && this.isMobileDevice() && !this.userInteracted) {
            mobileHelp.style.display = 'block';
            
            // Ocultar después de 5 segundos
            setTimeout(() => {
                this.hideMobileHelp();
            }, 5000);
        }
    }

    // 🆕 OCULTAR AYUDA PARA MÓVILES
    hideMobileHelp() {
        const mobileHelp = document.getElementById('mobileHelp');
        if (mobileHelp) {
            mobileHelp.style.display = 'none';
        }
    }

    // 🆕 PRECARGAR AUDIO (IMPORTANTE PARA MÓVILES)
    preloadCurrentTrack() {
        if (this.playlist.length === 0) return;
        
        const track = this.playlist[this.currentTrackIndex];
        if (!track) return;

        console.log('📱 Precargando audio para móvil:', track.file);
        
        // Crear un audio temporal para precargar
        const tempAudio = new Audio();
        tempAudio.src = track.file;
        tempAudio.preload = 'auto';
        tempAudio.load();
        
        this.audioLoaded = true;
    }

    updatePlayerUI() {
        // 🆕 Asegurarse de que los elementos existen antes de usarlos
        setTimeout(() => {
            const nowPlaying = document.getElementById('nowPlaying');
            const currentTrack = this.playlist[this.currentTrackIndex];
            if (nowPlaying && currentTrack) {
                nowPlaying.textContent = `Sonando: ${currentTrack.name}`;
                // 🎯 Actualizar fondo dinámico
                this.djmeshClient.updateDynamicBackground(currentTrack.image);
            }
        }, 100);
    }

    setupAudioEvents() {
        this.audio.addEventListener('ended', () => {
            console.log('🎵 Canción terminada, pasando a la siguiente...');
            this.handleTrackEnd();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('❌ Error de audio:', e);
            this.showError('Error cargando audio');
        });

        this.audio.addEventListener('canplaythrough', () => {
            console.log('✅ Audio listo para reproducir');
            this.audioLoaded = true;
        });

        this.audio.addEventListener('loadstart', () => {
            console.log('🔍 Cargando audio...');
        });

        // 🆕 MANEJAR ERRORES ESPECÍFICOS DE MÓVILES
        this.audio.addEventListener('play', () => {
            console.log('▶️ Reproducción iniciada');
        });

        this.audio.addEventListener('pause', () => {
            console.log('⏸️ Reproducción pausada');
        });
    }

    handleTrackEnd() {
        const duration = Math.floor((Date.now() - this.trackStartTime) / 1000);
        this.completeSACMTracking(this.currentTrackName, duration);
        
        // 🎯 Cambiar a siguiente canción automáticamente
        this.nextTrack();
    }

    togglePlay() {
        if (!this.userInteracted && this.isMobileDevice()) {
            console.log('📱 Usuario no ha interactuado todavía en móvil');
            this.showMobileHelp();
            return;
        }

        if (this.isPlaying) {
            this.pause();
        } else {
            this.playCurrentTrack();
        }
    }

    // 🆕 MÉTODO MEJORADO PARA REPRODUCIR
    async playCurrentTrack() {
        if (this.playlist.length === 0) {
            console.log('❌ No hay playlist disponible');
            this.showError('No hay música disponible');
            return;
        }

        const track = this.playlist[this.currentTrackIndex];
        if (!track) {
            console.log('❌ No hay track disponible');
            return;
        }

        console.log('🎵 Intentando reproducir:', track.file);
        
        // 🎯 EN MÓVILES: Asegurarse de que el usuario ya interactuó
        if (this.isMobileDevice() && !this.userInteracted) {
            console.log('📱 Bloqueado: usuario no ha interactuado en móvil');
            this.showMobileHelp();
            return;
        }

        this.startSACMTracking(track.name);
        
        this.audio.src = track.file;
        
        // 🎯 ESTRATEGIA MEJORADA PARA MÓVILES
        const playAudio = async () => {
            try {
                // 🆕 INTENTAR REPRODUCIR CON AudioContext SI ES NECESARIO
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }

                await this.audio.play();
                this.isPlaying = true;
                document.getElementById('musicToggle').textContent = '⏸️';
                this.updatePlayerUI();
                console.log('✅ Reproducción iniciada correctamente');
            } catch (error) {
                console.error('❌ Error al reproducir:', error);
                
                // 🆕 INTENTAR CREAR AudioContext SI FALLA
                if (error.name === 'NotAllowedError') {
                    console.log('🔧 Intentando con AudioContext...');
                    try {
                        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        await this.audioContext.resume();
                        
                        // Reconectar el audio al contexto
                        const source = this.audioContext.createMediaElementSource(this.audio);
                        source.connect(this.audioContext.destination);
                        
                        // Intentar reproducir de nuevo
                        await this.audio.play();
                        this.isPlaying = true;
                        document.getElementById('musicToggle').textContent = '⏸️';
                        this.updatePlayerUI();
                        console.log('✅ Reproducción iniciada con AudioContext');
                    } catch (secondError) {
                        console.error('❌ Error con AudioContext:', secondError);
                        this.showError('Toca para reproducir 🔊');
                    }
                } else {
                    this.showError('Haz clic para reproducir');
                }
                
                this.isPlaying = false;
                document.getElementById('musicToggle').textContent = '🎵';
            }
        };

        // 🎯 EN MÓVILES: Esperar a que el audio esté listo
        if (this.isMobileDevice() && !this.audioLoaded) {
            console.log('📱 Esperando a que el audio se cargue...');
            this.audio.load();
            this.audio.addEventListener('canplaythrough', () => {
                playAudio();
            }, { once: true });
        } else {
            playAudio();
        }
    }

    // 🎯 Método para tracking SACM
    startSACMTracking(trackName) {
        this.trackStartTime = Date.now();
        this.currentTrackName = trackName;

        if (this.djmeshClient.socket?.readyState === WebSocket.OPEN) {
            this.djmeshClient.socket.send(JSON.stringify({
                type: 'music_play_start',
                songId: trackName,
                userId: this.djmeshClient.currentUser
            }));
        }
    }

    completeSACMTracking(trackName, duration) {
        if (this.djmeshClient.socket?.readyState === WebSocket.OPEN) {
            this.djmeshClient.socket.send(JSON.stringify({
                type: 'music_play_complete',
                songId: trackName,
                userId: this.djmeshClient.currentUser,
                duration: duration
            }));
            console.log('📊 Tracking SACM enviado:', { trackName, duration });
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        document.getElementById('musicToggle').textContent = '🎵';
        
        if (this.trackStartTime > 0) {
            const duration = Math.floor((Date.now() - this.trackStartTime) / 1000);
            this.completeSACMTracking(this.currentTrackName, duration);
        }
    }

    nextTrack() {
        if (this.playlist.length === 0) return;
        
        this.pause();
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.audioLoaded = false; // 🆕 Resetear estado de carga
        this.playCurrentTrack();
    }

    prevTrack() {
        if (this.playlist.length === 0) return;
        
        this.pause();
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.audioLoaded = false; // 🆕 Resetear estado de carga
        this.playCurrentTrack();
    }

    showError(message) {
        const nowPlaying = document.getElementById('nowPlaying');
        if (nowPlaying) {
            nowPlaying.textContent = message;
            // 🎯 Destacar el mensaje de error
            nowPlaying.style.color = '#ff6b6b';
            setTimeout(() => {
                nowPlaying.style.color = '';
            }, 3000);
        }
        document.getElementById('musicToggle').textContent = '🎵';
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 DJMesh iniciando...');
    window.djmeshApp = new DJMeshClient();
});
