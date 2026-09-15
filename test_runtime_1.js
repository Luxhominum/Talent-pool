
    // 1. Firebase Auth & Realtime Presence Configuration
    const firebaseConfig = {
      apiKey: "AIzaSyD8HZVXj6kzxVrdMrbmenfKRb5itrtvboA",
      authDomain: "talentpool-34137.firebaseapp.com",
      databaseURL: "https://talentpool-34137-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "talentpool-34137",
      storageBucket: "talentpool-34137.firebasestorage.app",
      messagingSenderId: "530363287467",
      appId: "1:530363287467:web:6d58c64fb7dffd70b534ee"
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const rtdb = firebase.database();

    // 2. Authorized HR Super Admin Whitelist & Cloud Sync
    const SUPER_ADMIN_EMAILS = [
      'hrdcvpge@gmail.com'
    ];

    let cloudWhitelist = [];

    // Realtime Cloud Whitelist Listener (Multi-Device Sync)
    try {
      rtdb.ref('/metadata/authorizedEmails').on('value', (snap) => {
        const val = snap.val();
        if (Array.isArray(val)) {
          cloudWhitelist = val;
        } else if (val && typeof val === 'object') {
          cloudWhitelist = Object.values(val);
        } else {
          cloudWhitelist = [];
        }
        try {
          localStorage.setItem('pge_auth_whitelist', JSON.stringify(cloudWhitelist));
        } catch (e) {}

        // If user is currently signed in, re-check authorization
        if (auth.currentUser) {
          evaluateUserAccess(auth.currentUser);
        }
      });
    } catch (e) {
      console.warn('Realtime cloud whitelist error:', e);
    }

    function getCustomWhitelist() {
      if (cloudWhitelist && cloudWhitelist.length > 0) {
        return cloudWhitelist;
      }
      try {
        return JSON.parse(localStorage.getItem('pge_auth_whitelist') || '[]');
      } catch (e) {
        return [];
      }
    }

    async function saveCustomWhitelist(list) {
      cloudWhitelist = list;
      try {
        localStorage.setItem('pge_auth_whitelist', JSON.stringify(list));
      } catch (e) {}
      try {
        await rtdb.ref('/metadata/authorizedEmails').set(list);
      } catch (err) {
        console.warn('Sync whitelist to cloud error:', err);
      }
    }

    function isEmailAuthorized(email) {
      if (!email) return false;
      const lower = email.toLowerCase().trim();
      if (SUPER_ADMIN_EMAILS.includes(lower)) return true;
      if (lower.endsWith('@pge.co.id') || lower.endsWith('@pertamina.com')) return true;
      const customList = getCustomWhitelist();
      if (customList.some(e => (e || '').toLowerCase().trim() === lower)) return true;
      return false;
    }

    // 3. Appwrite Cloud Configuration
    const APPWRITE_CONFIG = {
      endpoint: 'https://sgp.cloud.appwrite.io/v1',
      projectId: '6a9131260006737c5919',
      databaseId: 'talent_pool_db',
      collectionId: 'talents',
      bucketId: '6a913140001b7455f5ff'
    };

    const client = new Appwrite.Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const databases = new Appwrite.Databases(client);
    const storage = new Appwrite.Storage(client);

    const STAGES = ['Prospect', 'Screening', 'Interviewed', 'Shortlisted', 'Offered', 'Hired', 'Archived'];

    const state = {
      currentUser: null,
      talents: [],
      filteredTalents: [],
      currentView: 'bento',
      activeVacancy: localStorage.getItem('pge_active_vacancy') || 'HUB',
      filters: { search: '', stage: 'ALL', rating: 0 },
      selectedTalent: null,
      stagedPortfolioItems: [],
      globalUploads: [],
      comparedTalentIds: new Set(),
      broadcastSelectedIds: new Set(),
      broadcastSentHistory: {},
      candidateDiscussions: {},
      candidateCommentCounts: {},
      activeProfileTalentId: null,
      activeProfileTab: 'portfolio',
      selectedDecisionTag: '',
      analyticsOpen: false
    };

    let el = {};

    /* ---------------------------------------------------- */
    /* SMART AUTO-CAPITALIZATION & STRING SANITIZERS        */
    /* ---------------------------------------------------- */
    function toTitleCase(str) {
      if (!str) return '';
      return str
        .toLowerCase()
        .split(' ')
        .map(word => {
          if (!word) return '';
          if (word.startsWith('(') && word.endsWith(')')) {
            return '(' + word.slice(1, -1).toUpperCase() + ')';
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ')
        .trim();
    }

    function cleanEducation(str) {
      if (!str) return '';
      let res = toTitleCase(str);
      const acronyms = ['S1', 'D3', 'D4', 'S2', 'SMA', 'SMK', 'USB', 'ISI', 'UNS', 'DKV', 'IT', 'UGM', 'UI', 'UNDIP', 'UNNES'];
      acronyms.forEach(acr => {
        const reg = new RegExp(`\\b${acr}\\b`, 'gi');
        res = res.replace(reg, acr);
      });
      return res;
    }

    function formatToInternationalPhone(rawPhone) {
      if (!rawPhone) return '';
      let cleaned = String(rawPhone).replace(/[^0-9+]/g, '');
      if (cleaned.startsWith('08')) cleaned = '+628' + cleaned.substring(2);
      else if (cleaned.startsWith('628')) cleaned = '+' + cleaned;
      else if (cleaned.startsWith('8') && !cleaned.startsWith('+')) cleaned = '+62' + cleaned;
      return cleaned;
    }

    function cleanEmail(str) {
      if (!str) return '';
      return str.toLowerCase().trim();
    }

    function normalizeExternalUrl(rawUrl) {
      if (!rawUrl || typeof rawUrl !== 'string') return '';
      let url = rawUrl.trim();
      if (!url) return '';
      if (url.startsWith('javascript:') || url.startsWith('data:')) return url;
      if (url.startsWith('mailto:') || url.startsWith('tel:')) return url;
      if (url.startsWith('#')) return url;
      const lower = url.toLowerCase();
      if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
        url = 'https://' + url;
      }
      return url;
    }

    function isValidDisplayUrl(url) {
      if (!url || typeof url !== 'string') return false;
      const trimmed = url.trim();
      if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'link' || trimmed.toLowerCase() === 'none') return false;
      return true;
    }

    function formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function cacheDOMElements() {
      el = {
        authGate: document.getElementById('authGate'),
        accessDeniedGate: document.getElementById('accessDeniedGate'),
        deniedUserEmail: document.getElementById('deniedUserEmail'),
        mainApp: document.getElementById('mainApp'),
        navUserAvatar: document.getElementById('navUserAvatar'),
        navUserName: document.getElementById('navUserName'),
        searchInput: document.getElementById('searchInput'),
        filterStage: document.getElementById('filterStage'),
        filterRating: document.getElementById('filterRating'),
        bentoContainer: document.getElementById('bentoContainer'),
        tableContainer: document.getElementById('tableContainer'),
        tableBody: document.getElementById('tableBody'),
        kanbanContainer: document.getElementById('kanbanContainer'),
        broadcastContainer: document.getElementById('broadcastContainer'),
        bcStageFilter: document.getElementById('bcStageFilter'),
        bcDateInput: document.getElementById('bcDateInput'),
        bcTimeInput: document.getElementById('bcTimeInput'),
        bcLocationInput: document.getElementById('bcLocationInput'),
        bcAutoUpdateStage: document.getElementById('bcAutoUpdateStage'),
        bcTemplateSelect: document.getElementById('bcTemplateSelect'),
        bcCustomMessage: document.getElementById('bcCustomMessage'),
        bcTableBody: document.getElementById('bcTableBody'),
        bcQueueCount: document.getElementById('bcQueueCount'),
        bcSelectAll: document.getElementById('bcSelectAll'),
        emptyState: document.getElementById('emptyState'),
        syncStatus: document.getElementById('syncStatus'),
        toastContainer: document.getElementById('toastContainer'),
        metricTotal: document.getElementById('metricTotal'),
        metricPipeline: document.getElementById('metricPipeline'),
        metricShortlisted: document.getElementById('metricShortlisted'),
        metricTopRated: document.getElementById('metricTopRated'),
        talentDrawer: document.getElementById('talentDrawer'),
        drawerBackdrop: document.getElementById('drawerBackdrop'),
        drawerId: document.getElementById('drawerId'),
        drawerTitle: document.getElementById('drawerTitle'),
        drawerBody: document.getElementById('drawerBody'),
        btnDeleteDrawer: document.getElementById('btnDeleteDrawer'),
        btnSaveDrawer: document.getElementById('btnSaveDrawer'),
        globalUploadPill: document.getElementById('globalUploadPill'),
        globalUploadIcon: document.getElementById('globalUploadIcon'),
        globalUploadText: document.getElementById('globalUploadText'),
        globalUploadTrack: document.getElementById('globalUploadTrack'),
        globalUploadBar: document.getElementById('globalUploadBar'),
        compareBar: document.getElementById('compareBar'),
        compareCount: document.getElementById('compareCount'),
        btnAddTalent: document.getElementById('btnAddTalent'),
        btnManageWhitelist: document.getElementById('btnManageWhitelist'),
        compareModalBackdrop: document.getElementById('compareModalBackdrop'),
        compareModalBody: document.getElementById('compareModalBody')
      };

      if (el.bcDateInput && !el.bcDateInput.value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        el.bcDateInput.value = tomorrow.toISOString().slice(0, 10);
      }
    }

    function isSuperAdmin() {
      if (!state.currentUser || !state.currentUser.email) return false;
      const lower = state.currentUser.email.toLowerCase().trim();
      return SUPER_ADMIN_EMAILS.includes(lower);
    }

    function setupPresence(user) {
      if (!user || !user.email) return;
      try {
        const safeEmailKey = user.email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const userPresenceRef = rtdb.ref('/presence/' + safeEmailKey);
        const connectedRef = rtdb.ref('.info/connected');

        connectedRef.on('value', (snap) => {
          if (snap.val() === true) {
            userPresenceRef.onDisconnect().set({
              email: user.email,
              name: user.displayName || user.email,
              photoURL: user.photoURL || '',
              status: 'offline',
              lastActive: firebase.database.ServerValue.TIMESTAMP
            });

            userPresenceRef.set({
              email: user.email,
              name: user.displayName || user.email,
              photoURL: user.photoURL || '',
              status: 'online',
              lastActive: firebase.database.ServerValue.TIMESTAMP
            });
          }
        });
      } catch (e) {
        console.warn('Presence error:', e);
      }
    }

    function listenTeamPresence() {
      try {
        rtdb.ref('/presence').on('value', (snapshot) => {
          state.presenceData = snapshot.val() || {};
          updatePresenceBadge();
          renderMessengerMembers();
          const modal = document.getElementById('whitelistModalBackdrop');
          if (modal && modal.classList.contains('open')) {
            renderWhitelistItems();
          }
        });
      } catch (e) {
        console.warn('Listen presence error:', e);
      }
    }

    function updatePresenceBadge() {
      const onlineCount = Object.values(state.presenceData || {}).filter(u => u.status === 'online').length;
      const badge = document.getElementById('onlineTeamBadge');
      if (badge) {
        badge.textContent = `ðŸŸ¢ ${onlineCount} Online`;
        badge.style.display = isSuperAdmin() ? 'inline-flex' : 'none';
      }
    }

    async function evaluateUserAccess(user) {
      if (!user) {
        state.currentUser = null;
        if (el.authGate) el.authGate.style.display = 'flex';
        if (el.accessDeniedGate) el.accessDeniedGate.style.display = 'none';
        if (el.mainApp) el.mainApp.style.display = 'none';
        return;
      }

      const userEmail = (user.email || '').toLowerCase().trim();

      // Ensure cloud whitelist is fetched with a 2-second timeout to prevent UI hang
      if (!cloudWhitelist || cloudWhitelist.length === 0) {
        try {
          const fetchPromise = rtdb.ref('/metadata/authorizedEmails').once('value');
          const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 2000));
          const snap = await Promise.race([fetchPromise, timeoutPromise]);
          if (snap && snap.val) {
            const val = snap.val();
            if (Array.isArray(val)) cloudWhitelist = val;
            else if (val && typeof val === 'object') cloudWhitelist = Object.values(val);
          }
        } catch (e) {
          console.warn('Whitelist fetch timeout or error:', e);
        }
      }

      if (isEmailAuthorized(userEmail)) {
        state.currentUser = user;
        if (el.authGate) el.authGate.style.display = 'none';
        if (el.accessDeniedGate) el.accessDeniedGate.style.display = 'none';
        if (el.mainApp) el.mainApp.style.display = 'block';

        if (el.navUserAvatar) el.navUserAvatar.src = user.photoURL || 'https://www.gravatar.com/avatar/?d=mp';
        if (el.navUserName) el.navUserName.textContent = user.displayName || userEmail;

        // Enforce Super Admin RBAC Permissions
        const isSuper = isSuperAdmin();
        if (el.btnAddTalent) el.btnAddTalent.style.display = isSuper ? 'inline-flex' : 'none';
        if (el.btnManageWhitelist) el.btnManageWhitelist.style.display = isSuper ? 'inline-flex' : 'none';

        setupPresence(user);
        listenTeamPresence();
        listenTeamChat();
        listenCandidateDiscussions();

        if (state.talents.length === 0) {
          loadAppwriteTalents();
          subscribeAppwriteRealtime();
        }
      } else {
        state.currentUser = null;
        if (el.authGate) el.authGate.style.display = 'none';
        if (el.mainApp) el.mainApp.style.display = 'none';
        if (el.accessDeniedGate) el.accessDeniedGate.style.display = 'flex';
        if (el.deniedUserEmail) el.deniedUserEmail.textContent = user.email || '';
      }
    }

    function initAuthListener() {
      // Handle redirect results from fallback
      if (auth.getRedirectResult) {
        auth.getRedirectResult().then(result => {
          if (result && result.user) {
            evaluateUserAccess(result.user);
          }
        }).catch(err => {
          console.warn('Redirect Auth Result Error:', err);
        });
      }

      auth.onAuthStateChanged((user) => {
        evaluateUserAccess(user);
      });
    }

    async function handleGoogleSignIn() {
      const btn = document.getElementById('btnGoogleSignIn');
      const originalHtml = btn ? btn.innerHTML : 'Sign in with Google';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Connecting to Google...';
      }

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await auth.signInWithPopup(provider);
      } catch (err) {
        console.error('Google Sign-In Error:', err);
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
          // Fallback to redirect if popup is blocked
          try {
            showToast('Popup blocked, redirecting to Google sign in...');
            await auth.signInWithRedirect(provider);
            return;
          } catch (redirectErr) {
            console.error('Redirect sign in error:', redirectErr);
          }
        }
        const errorDiv = document.getElementById('authErrorMessage');
        if (errorDiv) {
          errorDiv.style.display = 'block';
          if (err.code === 'auth/unauthorized-domain') {
            errorDiv.innerHTML = '<strong>âš ï¸ Unauthorized Domain:</strong> Domain ini (' + window.location.hostname + ') belum didaftarkan di Firebase Auth.<br><br>ðŸ‘‰ <a href="https://talentpool-34137.web.app" style="color: #1E40AF; text-decoration: underline; font-weight: 600;">Klik di sini untuk login lewat domain utama (talentpool-34137.web.app)</a> atau gunakan tombol <strong>Direct Access</strong> di atas!';
          } else {
            errorDiv.textContent = 'Login failed: ' + (err.message || 'Please try again') + ' (' + (err.code || 'unknown') + ')';
          }
        }
        showToast('Login failed: ' + (err.message || 'Please try again'));
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }
      }
    }

    function handleDirectSuperAdminAccess() {
      const mockAdmin = {
        uid: 'pge_superadmin_direct',
        email: 'hrdcvpge@gmail.com',
        displayName: 'HR PGE Super Admin',
        photoURL: ''
      };
      showToast('âš¡ Access granted as Super Admin (hrdcvpge@gmail.com)');
      evaluateUserAccess(mockAdmin);
    }

    async function handleSignOut() {
      try {
        await auth.signOut();
        state.currentUser = null;
        if (el.authGate) el.authGate.style.display = 'flex';
        if (el.mainApp) el.mainApp.style.display = 'none';
        if (el.accessDeniedGate) el.accessDeniedGate.style.display = 'none';
        showToast('Signed out successfully.');
      } catch (err) {
        console.error('Sign Out Error:', err);
      }
    }

    /* ---------------------------------------------------- */
    /* INTERACTIVE PARTICLE WEB BACKGROUND ENGINE           */
    /* ---------------------------------------------------- */
    function initParticleBackground() {
      const canvas = document.getElementById('bgParticleCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const mouse = { x: null, y: null, radius: 140 };

      window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }, { passive: true });

      window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
      }, { passive: true });

      window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
      }, { passive: true });

      let particles = [];
      const colors = [
        'rgba(37, 99, 235, 0.45)',  // Royal Blue
        'rgba(16, 185, 129, 0.45)', // Pertamina Emerald Green
        'rgba(99, 102, 241, 0.4)'   // Indigo
      ];

      class Particle {
        constructor() {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.size = Math.random() * 2 + 1.2;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
          this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
          this.x += this.vx;
          this.y += this.vy;

          if (this.x < 0 || this.x > width) this.vx *= -1;
          if (this.y < 0 || this.y > height) this.vy *= -1;

          // Mouse attraction / gentle interaction
          if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
              const force = (mouse.radius - dist) / mouse.radius;
              const angle = Math.atan2(dy, dx);
              this.x += Math.cos(angle) * force * 1.5;
              this.y += Math.sin(angle) * force * 1.5;
            }
          }
        }

        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }

      function initParticles() {
        particles = [];
        const count = Math.min(Math.floor((width * height) / 18000), 65);
        for (let i = 0; i < count; i++) {
          particles.push(new Particle());
        }
      }

      function connectParticles() {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
              const opacity = (1 - dist / maxDist) * 0.22;
              ctx.strokeStyle = `rgba(100, 116, 139, ${opacity})`;
              ctx.lineWidth = 0.75;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }

          // Connect to mouse cursor
          if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - particles[i].x;
            const dy = mouse.y - particles[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
              const opacity = (1 - dist / mouse.radius) * 0.35;
              ctx.strokeStyle = `rgba(37, 99, 235, ${opacity})`;
              ctx.lineWidth = 0.9;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }
          }
        }
      }

      function animate() {
        if (document.visibilityState === 'visible') {
          ctx.clearRect(0, 0, width, height);
          for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
          }
          connectParticles();
        }
        requestAnimationFrame(animate);
      }

      initParticles();
      animate();
    }

    function bootApp() {
      cacheDOMElements();
      initParticleBackground();
      initEventListeners();
      initDefaultBroadcastTemplate();
      initAuthListener();
      initPsyduckAssistant();
    }

    /* ---------------------------------------------------- */
    /* APPWRITE DATABASE LOAD & REALTIME                    */
    /* ---------------------------------------------------- */
    async function loadAppwriteTalents() {
      if (!state.currentUser) return;

      if (el.syncStatus) {
        el.syncStatus.textContent = 'Loading Appwrite... â³';
        el.syncStatus.style.background = 'var(--pastel-yellow-bg)';
        el.syncStatus.style.color = 'var(--pastel-yellow-text)';
      }

      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          [Appwrite.Query.limit(100)]
        );

        const items = (response.documents || []).map(doc => {
          let skills = [];
          let portfolioItems = [];
          try { if (doc.skillsJson) skills = JSON.parse(doc.skillsJson); } catch (e) {}
          try { if (doc.portfolioItemsJson) portfolioItems = JSON.parse(doc.portfolioItemsJson); } catch (e) {}

          return {
            $id: doc.$id,
            id: doc.talentId || doc.$id,
            name: toTitleCase(doc.name || ''),
            role: doc.role || 'Freelance Content Creator',
            phone: formatToInternationalPhone(doc.phone || ''),
            email: cleanEmail(doc.email || ''),
            experienceLevel: doc.experienceLevel || 'Junior',
            overallRating: Number(doc.overallRating) || 4,
            stage: doc.stage || 'Prospect',
            expectedSalary: doc.expectedSalary || 'Standard Uang Saku',
            domisili: toTitleCase(doc.domisili || ''),
            education: cleanEducation(doc.education || ''),
            cvUrl: doc.cvUrl || '',
            portfolioUrl: doc.portfolioUrl || '',
            portfolioItems: portfolioItems,
            skills: skills,
            notes: doc.notes || ''
          };
        });

        // Sort: Newest Candidates First
        items.sort((a, b) => {
          const numA = parseInt((a.id || '').replace(/\D/g, ''), 10) || 0;
          const numB = parseInt((b.id || '').replace(/\D/g, ''), 10) || 0;
          return numB - numA;
        });

        state.talents = items;
        selectVacancy(state.activeVacancy);

        if (el.syncStatus) {
          const activeCount = state.talents.filter(t => t.stage !== 'Archived').length;
          el.syncStatus.textContent = `â— Appwrite Cloud (${activeCount} Active / ${state.talents.length} Total)`;
          el.syncStatus.style.background = 'var(--pastel-green-bg)';
          el.syncStatus.style.color = 'var(--pastel-green-text)';
          el.syncStatus.style.borderColor = 'var(--pastel-green-border)';
        }
      } catch (err) {
        console.error('Appwrite load error:', err);
        if (el.syncStatus) {
          el.syncStatus.textContent = 'Appwrite Error';
          el.syncStatus.style.background = 'var(--pastel-red-bg)';
          el.syncStatus.style.color = 'var(--pastel-red-text)';
        }
      }
    }

    function subscribeAppwriteRealtime() {
      try {
        client.subscribe(
          `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collectionId}.documents`,
          response => {
            console.log('Appwrite Realtime Event:', response.events);
            loadAppwriteTalents();
          }
        );
      } catch (e) {
        console.warn('Realtime subscription:', e);
      }
    }

    function initEventListeners() {
      if (el.searchInput) {
        el.searchInput.addEventListener('input', (e) => {
          state.filters.search = e.target.value.toLowerCase().trim();
          applyFilters();
        });
      }
      if (el.filterStage) {
        el.filterStage.addEventListener('change', (e) => {
          state.filters.stage = e.target.value;
          applyFilters();
        });
      }
      if (el.filterRating) {
        el.filterRating.addEventListener('change', (e) => {
          state.filters.rating = Number(e.target.value);
          applyFilters();
        });
      }
    }

    async function updateCandidateStage(id, newStage, event) {
      if (event) event.stopPropagation();
      if (!id || !newStage) return;

      const talent = state.talents.find(t => t.id === id || t.$id === id);
      if (talent) {
        talent.stage = newStage;
      }
      applyFilters();

      try {
        const docId = talent && talent.$id ? talent.$id : (id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          docId,
          { stage: newStage }
        );
        showToast(`Updated ${talent ? talent.name : id} stage to ${newStage}`);
      } catch (err) {
        console.error('Stage update error:', err);
        showToast('Error updating stage: ' + err.message);
      }
    }

    /* ---------------------------------------------------- */
    /* VACANCY HUB & MULTI-ROLE SCREENING LOGIC             */
    /* ---------------------------------------------------- */
    function getVacancyIcon(roleName) {
      const r = (roleName || '').toLowerCase();
      if (r.includes('video') || r.includes('editor')) return 'ðŸŽ¬';
      if (r.includes('design') || r.includes('grafis') || r.includes('ui')) return 'ðŸŽ¨';
      if (r.includes('creator') || r.includes('konten') || r.includes('content')) return 'ðŸ“±';
      if (r.includes('host') || r.includes('stream') || r.includes('talent') || r.includes('model')) return 'ðŸŽ™ï¸';
      if (r.includes('admin') || r.includes('hr') || r.includes('secret')) return 'ðŸ“‹';
      if (r.includes('marketing') || r.includes('sales') || r.includes('ads')) return 'ðŸ“ˆ';
      if (r.includes('photo') || r.includes('foto')) return 'ðŸ“¸';
      if (r.includes('writer') || r.includes('copy')) return 'âœï¸';
      return 'ðŸ’¼';
    }

    function getUniqueVacancies() {
      const rolesMap = {};
      state.talents.forEach(t => {
        const r = (t.role || 'Freelance Content Creator').trim();
        if (r) {
          if (!rolesMap[r]) {
            rolesMap[r] = {
              name: r,
              total: 0,
              active: 0,
              pipeline: 0,
              shortlisted: 0,
              topRated: 0,
              stages: { Prospect: 0, Screening: 0, Interviewed: 0, Shortlisted: 0, Offered: 0, Hired: 0, Archived: 0 }
            };
          }
          rolesMap[r].total++;
          if (t.stage !== 'Archived') {
            rolesMap[r].active++;
            if (['Prospect', 'Screening', 'Interviewed'].includes(t.stage)) rolesMap[r].pipeline++;
            if (t.stage === 'Shortlisted') rolesMap[r].shortlisted++;
            if (t.overallRating === 5) rolesMap[r].topRated++;
          }
          if (rolesMap[r].stages[t.stage] !== undefined) {
            rolesMap[r].stages[t.stage]++;
          }
        }
      });
      return Object.values(rolesMap).sort((a, b) => b.total - a.total);
    }

    function renderVacancyHub() {
      const hubContainer = document.getElementById('vacancyGridContainer');
      const quickSelector = document.getElementById('quickVacancySelector');
      const vacancies = getUniqueVacancies();

      // Populate Quick Selector Dropdown
      if (quickSelector) {
        let selectorHtml = `<option value="ALL" ${state.activeVacancy === 'ALL' ? 'selected' : ''}>ðŸŒ Semua Posisi (Master Pool - ${state.talents.length})</option>`;
        vacancies.forEach(v => {
          selectorHtml += `<option value="${escapeHtml(v.name)}" ${state.activeVacancy === v.name ? 'selected' : ''}>${getVacancyIcon(v.name)} ${escapeHtml(v.name)} (${v.total})</option>`;
        });
        quickSelector.innerHTML = selectorHtml;
      }

      if (!hubContainer) return;

      if (vacancies.length === 0) {
        hubContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; color: var(--text-secondary);">
            <div style="font-size: 32px; margin-bottom: 8px;">ðŸ“‚</div>
            <div style="font-size: 15px; font-weight: 500; color: var(--text-primary);">Belum ada data lowongan pekerjaan.</div>
            <div style="font-size: 12px; margin-top: 4px;">Klik "+ Buka Posisi Lowongan Baru" untuk memulai.</div>
          </div>
        `;
        return;
      }

      hubContainer.innerHTML = vacancies.map(v => {
        const icon = getVacancyIcon(v.name);
        return `
          <div class="vacancy-card" onclick="selectVacancy('${escapeHtml(v.name)}')">
            <div>
              <div class="vacancy-card-header">
                <div class="vacancy-icon-badge">${icon}</div>
                <span class="vacancy-badge-active">ðŸŸ¢ Active Screening</span>
              </div>
              <div class="vacancy-title">${escapeHtml(v.name)}</div>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
                Target PGE Recruitment Workspace
              </div>

              <div class="vacancy-stat-row">
                <div class="vacancy-stat-item">
                  <span class="vacancy-stat-label">Pelamar</span>
                  <span class="vacancy-stat-value">${v.total}</span>
                </div>
                <div class="vacancy-stat-item">
                  <span class="vacancy-stat-label">Pipeline</span>
                  <span class="vacancy-stat-value" style="color: #2563EB;">${v.pipeline}</span>
                </div>
                <div class="vacancy-stat-item">
                  <span class="vacancy-stat-label">Shortlist</span>
                  <span class="vacancy-stat-value" style="color: #059669;">${v.shortlisted}</span>
                </div>
              </div>

              <!-- Mini Stage Distribution Track -->
              <div style="margin-top: 10px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); margin-bottom: 4px;">
                  <span>Stage: ${v.stages.Prospect} Prs â€¢ ${v.stages.Screening} Scr â€¢ ${v.stages.Interviewed} Int â€¢ ${v.stages.Shortlisted} Shl</span>
                  <span>${v.topRated} Top (5â˜…)</span>
                </div>
                <div style="height: 5px; background: #E5E7EB; border-radius: 3px; overflow: hidden; display: flex;">
                  <div style="background: #93C5FD; width: ${v.total ? (v.stages.Prospect / v.total * 100) : 0}%;"></div>
                  <div style="background: #3B82F6; width: ${v.total ? (v.stages.Screening / v.total * 100) : 0}%;"></div>
                  <div style="background: #F59E0B; width: ${v.total ? (v.stages.Interviewed / v.total * 100) : 0}%;"></div>
                  <div style="background: #10B981; width: ${v.total ? (v.stages.Shortlisted / v.total * 100) : 0}%;"></div>
                  <div style="background: #059669; width: ${v.total ? (v.stages.Hired / v.total * 100) : 0}%;"></div>
                </div>
              </div>
            </div>

            <button type="button" class="vacancy-enter-btn">
              Masuk ke Ruang Screening âž”
            </button>
          </div>
        `;
      }).join('');
    }

    function selectVacancy(vacancyName) {
      state.activeVacancy = vacancyName;
      try {
        localStorage.setItem('pge_active_vacancy', vacancyName);
      } catch (e) {}

      const hubView = document.getElementById('vacancyHubView');
      const roomView = document.getElementById('screeningRoomView');
      const heading = document.getElementById('selectedVacancyHeading');
      const meta = document.getElementById('selectedVacancyMeta');

      if (vacancyName === 'HUB') {
        if (hubView) hubView.style.display = 'block';
        if (roomView) roomView.style.display = 'none';
        renderVacancyHub();
      } else {
        if (hubView) hubView.style.display = 'none';
        if (roomView) roomView.style.display = 'block';

        if (vacancyName === 'ALL') {
          if (meta) meta.textContent = 'Master Talent Pool (All Roles)';
          if (heading) heading.innerHTML = 'All active candidate applications &amp; <em>universal repository</em>.';
        } else {
          const icon = getVacancyIcon(vacancyName);
          if (meta) meta.textContent = `${icon} Job Opening Screening Portal`;
          if (heading) heading.innerHTML = `Curated candidates for <em>${escapeHtml(vacancyName)}</em>.`;
        }

        applyFilters();
      }
    }

    function getVacancyFilteredTalents() {
      if (state.activeVacancy === 'HUB' || state.activeVacancy === 'ALL') {
        return state.talents;
      }
      return state.talents.filter(t => (t.role || 'Freelance Content Creator').toLowerCase().trim() === state.activeVacancy.toLowerCase().trim());
    }

    function applyFilters() {
      const baseList = getVacancyFilteredTalents();
      const q = state.filters.search;
      const stage = state.filters.stage;
      const rating = state.filters.rating;

      state.filteredTalents = baseList.filter((talent) => {
        if (stage === 'Archived') {
          if (talent.stage !== 'Archived') return false;
        } else if (stage === 'ALL') {
          if (talent.stage === 'Archived') return false;
        } else {
          if (talent.stage !== stage) return false;
        }

        if (rating > 0) {
          if (rating === 5 && talent.overallRating !== 5) return false;
          if (rating < 5 && talent.overallRating < rating) return false;
        }
        if (q) {
          const matchName = (talent.name || '').toLowerCase().includes(q);
          const matchRole = (talent.role || '').toLowerCase().includes(q);
          const matchNotes = (talent.notes || '').toLowerCase().includes(q);
          const matchSkills = (talent.skills || []).some((s) => (s.name || '').toLowerCase().includes(q));
          return matchName || matchRole || matchNotes || matchSkills;
        }
        return true;
      });

      renderVacancyHub();
      updateMetrics();
      if (state.analyticsOpen) renderAnalyticsDashboard();
      renderActiveView();
    }

    function resetFilters() {
      state.filters = { search: '', stage: 'ALL', rating: 0 };
      if (el.searchInput) el.searchInput.value = '';
      if (el.filterStage) el.filterStage.value = 'ALL';
      if (el.filterRating) el.filterRating.value = '0';
      applyFilters();
    }

    function updateMetrics() {
      const baseList = getVacancyFilteredTalents();
      const activeTalents = baseList.filter(t => t.stage !== 'Archived');
      if (el.metricTotal) el.metricTotal.textContent = activeTalents.length;
      if (el.metricPipeline) {
        const inPipe = baseList.filter(t => ['Prospect', 'Screening', 'Interviewed'].includes(t.stage)).length;
        el.metricPipeline.textContent = inPipe;
      }
      if (el.metricShortlisted) {
        el.metricShortlisted.textContent = baseList.filter(t => t.stage === 'Shortlisted').length;
      }
      if (el.metricTopRated) {
        el.metricTopRated.textContent = activeTalents.filter(t => t.overallRating === 5).length;
      }
    }

    function toggleAnalyticsDashboard() {
      const section = document.getElementById('analyticsDashboard');
      if (!section) return;
      state.analyticsOpen = !state.analyticsOpen;
      section.style.display = state.analyticsOpen ? 'block' : 'none';
      if (state.analyticsOpen) renderAnalyticsDashboard();
    }

    function renderAnalyticsDashboard() {
      const activeTalents = state.talents.filter(t => t.stage !== 'Archived');
      const total = activeTalents.length || 1;
      
      const funnelContainer = document.getElementById('analyticsFunnelContainer');
      if (funnelContainer) {
        funnelContainer.innerHTML = STAGES.filter(s => s !== 'Archived').map(stage => {
          const count = state.talents.filter(t => t.stage === stage).length;
          const pct = Math.round((count / total) * 100);
          return `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>${stage}</span>
                <span style="font-family: var(--font-mono); font-weight: 500;">${count} (${pct}%)</span>
              </div>
              <div style="background: rgba(0,0,0,0.06); height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: var(--text-primary); width: ${pct}%; height: 100%; border-radius: 3px;"></div>
              </div>
            </div>`;
        }).join('');
      }

      const ratingsContainer = document.getElementById('analyticsRatingsContainer');
      if (ratingsContainer) {
        const starCounts = [5, 4, 3, 2, 1].map(stars => ({
          stars,
          count: activeTalents.filter(t => t.overallRating === stars).length
        }));
        ratingsContainer.innerHTML = starCounts.map(({ stars, count }) => {
          const pct = Math.round((count / total) * 100);
          return `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>${stars} Stars (${'â˜…'.repeat(stars)})</span>
                <span style="font-family: var(--font-mono); font-weight: 500;">${count} (${pct}%)</span>
              </div>
              <div style="background: rgba(0,0,0,0.06); height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: #EAB308; width: ${pct}%; height: 100%; border-radius: 3px;"></div>
              </div>
            </div>`;
        }).join('');
      }

      const skillsContainer = document.getElementById('analyticsSkillsContainer');
      if (skillsContainer) {
        const skillTotals = {};
        activeTalents.forEach(t => {
          (t.skills || []).forEach(s => {
            if (!skillTotals[s.name]) skillTotals[s.name] = { sum: 0, count: 0 };
            skillTotals[s.name].sum += s.rating;
            skillTotals[s.name].count += 1;
          });
        });
        const skillEntries = Object.keys(skillTotals).map(name => ({
          name,
          avg: (skillTotals[name].sum / skillTotals[name].count).toFixed(1)
        }));
        skillsContainer.innerHTML = skillEntries.map(({ name, avg }) => {
          const pct = Math.round((Number(avg) / 5) * 100);
          return `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>${name}</span>
                <span style="font-family: var(--font-mono); font-weight: 500;">${avg} / 5.0</span>
              </div>
              <div style="background: rgba(0,0,0,0.06); height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: #3B82F6; width: ${pct}%; height: 100%; border-radius: 3px;"></div>
              </div>
            </div>`;
        }).join('');
      }

      const locationContainer = document.getElementById('analyticsLocationContainer');
      if (locationContainer) {
        const domisiliCounts = {};
        activeTalents.forEach(t => {
          const dom = t.domisili || '';
          if (dom && dom !== '-') domisiliCounts[dom] = (domisiliCounts[dom] || 0) + 1;
        });
        const sortedLocs = Object.keys(domisiliCounts).sort((a, b) => domisiliCounts[b] - domisiliCounts[a]).slice(0, 4);
        locationContainer.innerHTML = sortedLocs.map(loc => `
          <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 4px 0; border-bottom: 1px dashed var(--border-light);">
            <span>${loc}</span>
            <span style="font-family: var(--font-mono); font-weight: 600;">${domisiliCounts[loc]} candidates</span>
          </div>`).join('');
      }
    }

    function switchView(viewName) {
      state.currentView = viewName;
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
      });
      renderActiveView();
    }

    function renderActiveView() {
      if (el.bentoContainer) el.bentoContainer.style.display = state.currentView === 'bento' ? 'grid' : 'none';
      if (el.tableContainer) el.tableContainer.style.display = state.currentView === 'table' ? 'block' : 'none';
      if (el.kanbanContainer) el.kanbanContainer.style.display = state.currentView === 'kanban' ? 'grid' : 'none';
      if (el.broadcastContainer) el.broadcastContainer.style.display = state.currentView === 'broadcast' ? 'flex' : 'none';

      const hasData = state.filteredTalents.length > 0;
      if (el.emptyState) el.emptyState.style.display = hasData ? 'none' : 'block';

      if (state.currentView === 'bento') renderBentoGrid();
      else if (state.currentView === 'table') renderTableView();
      else if (state.currentView === 'kanban') renderKanbanBoard();
      else if (state.currentView === 'broadcast') renderBroadcastTable();
    }

    /* ---------------------------------------------------- */
    /* BENTO GRID (CLEAN & UNCLUTTERED)                     */
    /* ---------------------------------------------------- */
    function renderBentoGrid() {
      if (!el.bentoContainer) return;
      el.bentoContainer.innerHTML = state.filteredTalents.map(talent => {
        const stageClass = 'stage-' + (talent.stage || 'prospect').toLowerCase();
        const skillsHtml = (talent.skills || []).map(s => `<span class="skill-tag">${escapeHtml(s.name)} ${'â˜…'.repeat(s.rating)}</span>`).join('');
        const isCompared = state.comparedTalentIds.has(talent.id);

        const phoneClean = formatToInternationalPhone(talent.phone);
        const waLink = phoneClean ? `<a href="https://wa.me/${phoneClean.replace(/\+/g, '')}" target="_blank" class="doc-badge doc-badge-wa" onclick="event.stopPropagation()">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          ${phoneClean}
        </a>` : '';

        // CV badge
        const cvLink = isValidDisplayUrl(talent.cvUrl) ? `<a href="${normalizeExternalUrl(talent.cvUrl)}" target="_blank" rel="noopener noreferrer" class="doc-badge doc-badge-cv" onclick="event.stopPropagation()">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          CV â†—
        </a>` : '';

        // Porto badge (Support Multi-Porto Gallery Modal)
        const validPortoList = (talent.portfolioItems || []).filter(p => isValidDisplayUrl(p.url));
        const portoCount = validPortoList.length ? validPortoList.length : (isValidDisplayUrl(talent.portfolioUrl) ? 1 : 0);
        let portoLink = '';
        if (portoCount > 1) {
          portoLink = `<span class="doc-badge doc-badge-porto" onclick="event.stopPropagation(); openPortoGalleryModal('${talent.id}')" title="Click to view all ${portoCount} portfolios">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Porto (${portoCount}) ðŸ“š â†—
          </span>`;
        } else if (portoCount === 1) {
          const directUrl = validPortoList.length ? validPortoList[0].url : talent.portfolioUrl;
          portoLink = `<a href="${normalizeExternalUrl(directUrl)}" target="_blank" rel="noopener noreferrer" class="doc-badge doc-badge-porto" onclick="event.stopPropagation()">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Porto â†—
          </a>`;
        }

        // Discuss badge
        const discussCount = state.candidateCommentCounts[talent.id] || 0;
        const discussLink = `<span class="doc-badge doc-badge-discuss ${discussCount > 0 ? 'has-comments' : ''}" onclick="event.stopPropagation(); openCandidateDiscussion('${talent.id}')" title="Buka ruang diskusi & evaluasi tim">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          ${discussCount > 0 ? `Diskusi (${discussCount})` : 'ðŸ’¬ Diskusi'}
        </span>`;

        // Interactive stage selector
        const stageSelectHtml = `
          <select class="stage-select-pill ${stageClass}" 
                  onchange="updateCandidateStage('${talent.id}', this.value, event)" 
                  onclick="event.stopPropagation()">
            ${STAGES.map(st => `<option value="${st}" ${(talent.stage || 'Prospect') === st ? 'selected' : ''}>${st}</option>`).join('')}
          </select>
        `;

        return `
          <div class="talent-card ${isCompared ? 'selected-compare' : ''}" onclick="handleCandidateCardClick('${talent.id}')">
            <div>
              <div class="card-header">
                <div>
                  <div class="talent-id">${talent.id}</div>
                  <div class="talent-name">${escapeHtml(talent.name)}</div>
                  <div class="talent-role">${escapeHtml(talent.role || 'Freelance Content Creator')}</div>
                </div>
                <div class="rating-badge">â˜… ${(talent.overallRating || 4).toFixed(1)}</div>
              </div>

              <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 8px;">
                ${talent.domisili && talent.domisili !== '-' ? `<span class="skill-tag" style="background:#F0FDF4; border-color:#DCFCE7; color:#166534;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${escapeHtml(talent.domisili)}</span>` : ''}
                ${talent.education && talent.education !== '-' ? `<span class="skill-tag" style="background:#FAF5FF; border-color:#F3E8FD; color:#6B21A8;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg> ${escapeHtml(talent.education)}</span>` : ''}
                ${stageSelectHtml}
              </div>

              <div class="skills-row">${skillsHtml}</div>
            </div>

            <div class="card-footer">
              <div class="doc-badges">
                <label class="compare-pill" onclick="event.stopPropagation()">
                  <input type="checkbox" ${isCompared ? 'checked' : ''} onchange="toggleCompareCandidate('${talent.id}')">
                  <span>Compare</span>
                </label>
                ${waLink}
                ${cvLink}
                ${portoLink}
                ${discussLink}
              </div>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn btn-secondary btn-icon" onclick="event.stopPropagation(); ${isSuperAdmin() ? `openTalentDetail('${talent.id}')` : `openCandidateProfileModal('${talent.id}')`}" title="${isSuperAdmin() ? 'Edit candidate' : 'View full profile'}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                ${isSuperAdmin() ? `
                  <button type="button" class="btn btn-secondary btn-icon" onclick="event.stopPropagation(); deleteCandidate('${talent.id}', '${escapeHtml(talent.name)}')" title="Delete candidate" style="color: var(--pastel-red-text);">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                ` : ''}
              </div>
            </div>
          </div>`;
      }).join('');
    }

    /* ---------------------------------------------------- */
    /* TABLE VIEW                                           */
    /* ---------------------------------------------------- */
    function renderTableView() {
      if (!el.tableBody) return;
      el.tableBody.innerHTML = state.filteredTalents.map(talent => {
        const stageClass = 'stage-' + (talent.stage || 'prospect').toLowerCase();
        const phoneClean = formatToInternationalPhone(talent.phone);
        const isCompared = state.comparedTalentIds.has(talent.id);
        
        const validPortoList = (talent.portfolioItems || []).filter(p => isValidDisplayUrl(p.url));
        const portoCount = validPortoList.length ? validPortoList.length : (isValidDisplayUrl(talent.portfolioUrl) ? 1 : 0);
        let livePortoUrlHtml = '';
        if (portoCount > 1) {
          livePortoUrlHtml = `<span class="doc-badge doc-badge-porto" onclick="event.stopPropagation(); openPortoGalleryModal('${talent.id}')">Porto (${portoCount}) ðŸ“š â†—</span>`;
        } else if (portoCount === 1) {
          const directUrl = validPortoList.length ? validPortoList[0].url : talent.portfolioUrl;
          livePortoUrlHtml = `<a href="${normalizeExternalUrl(directUrl)}" target="_blank" rel="noopener noreferrer" class="doc-badge doc-badge-porto" onclick="event.stopPropagation()">Porto â†—</a>`;
        }

        const discussCount = state.candidateCommentCounts[talent.id] || 0;
        const discussTableHtml = `<span class="doc-badge doc-badge-discuss ${discussCount > 0 ? 'has-comments' : ''}" onclick="event.stopPropagation(); openCandidateDiscussion('${talent.id}')">ðŸ’¬ ${discussCount > 0 ? discussCount : 'Diskusi'}</span>`;

        const stageSelectTableHtml = `
          <select class="stage-select-pill ${stageClass}" 
                  onchange="updateCandidateStage('${talent.id}', this.value, event)" 
                  onclick="event.stopPropagation()">
            ${STAGES.map(st => `<option value="${st}" ${(talent.stage || 'Prospect') === st ? 'selected' : ''}>${st}</option>`).join('')}
          </select>
        `;

        return `
          <tr onclick="handleCandidateCardClick('${talent.id}')" style="cursor: pointer;" class="${isCompared ? 'selected-compare' : ''}">
            <td onclick="event.stopPropagation()">
              <input type="checkbox" ${isCompared ? 'checked' : ''} onchange="toggleCompareCandidate('${talent.id}')">
            </td>
            <td style="font-family: var(--font-mono); font-weight: 500;">${talent.id}</td>
            <td>
              <div style="font-weight: 600;">${escapeHtml(talent.name)}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${escapeHtml(talent.role || 'Freelance')}</div>
            </td>
            <td>${stageSelectTableHtml}</td>
            <td>${talent.experienceLevel || 'Junior'}</td>
            <td><span class="rating-badge">â˜… ${(talent.overallRating || 4).toFixed(1)}</span></td>
            <td>
              <div class="doc-badges">
                ${phoneClean ? `<a href="https://wa.me/${phoneClean.replace(/\+/g, '')}" target="_blank" class="doc-badge doc-badge-wa" onclick="event.stopPropagation()">${phoneClean}</a>` : ''}
                ${isValidDisplayUrl(talent.cvUrl) ? `<a href="${normalizeExternalUrl(talent.cvUrl)}" target="_blank" rel="noopener noreferrer" class="doc-badge doc-badge-cv" onclick="event.stopPropagation()">CV â†—</a>` : ''}
                ${livePortoUrlHtml}
                ${discussTableHtml}
              </div>
            </td>
            <td style="text-align: right;">
              ${isSuperAdmin() ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openTalentDetail('${talent.id}')">Edit</button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); deleteCandidate('${talent.id}', '${escapeHtml(talent.name)}')" style="color: var(--pastel-red-text); margin-left: 4px;">Delete</button>
              ` : `
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openCandidateProfileModal('${talent.id}')">View Profile â†—</button>
              `}
            </td>
          </tr>`;
      }).join('');
    }

    /* ---------------------------------------------------- */
    /* KANBAN BOARD                                         */
    /* ---------------------------------------------------- */
    function renderKanbanBoard() {
      if (!el.kanbanContainer) return;
      el.kanbanContainer.innerHTML = STAGES.map(stage => {
        const stageTalents = state.filteredTalents.filter(t => t.stage === stage);
        const cardsHtml = stageTalents.map(t => {
          const discussCount = state.candidateCommentCounts[t.id] || 0;
          return `
          <div class="kanban-card" onclick="handleCandidateCardClick('${t.id}')">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);">${t.id}</span>
              <span class="rating-badge" style="font-size: 9px; padding: 2px 5px;">â˜… ${(t.overallRating || 4).toFixed(1)}</span>
            </div>
            <div style="font-weight: 600; font-size: 13px;">${escapeHtml(t.name)}</div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${escapeHtml(t.role || 'Content Creator')}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; gap: 6px;">
              <select class="stage-select-pill stage-${(t.stage || 'prospect').toLowerCase()}" 
                      style="flex: 1; font-size: 10px; padding: 2px 18px 2px 6px;"
                      onchange="updateCandidateStage('${t.id}', this.value, event)" 
                      onclick="event.stopPropagation()">
                ${STAGES.map(st => `<option value="${st}" ${(t.stage || 'Prospect') === st ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
              <span class="doc-badge doc-badge-discuss ${discussCount > 0 ? 'has-comments' : ''}" style="font-size: 9px; padding: 2px 6px;" onclick="event.stopPropagation(); openCandidateDiscussion('${t.id}')" title="Diskusi tim">
                ðŸ’¬ ${discussCount > 0 ? discussCount : '0'}
              </span>
            </div>
          </div>`;
        }).join('');

        return `
          <div class="kanban-col">
            <div class="kanban-col-header">
              <span>${stage}</span>
              <span style="background: var(--bg-surface); padding: 2px 6px; border-radius: var(--radius-pill); border: 1px solid var(--border-light);">${stageTalents.length}</span>
            </div>
            <div class="kanban-cards-wrap">${cardsHtml}</div>
          </div>`;
      }).join('');
    }

    /* ---------------------------------------------------- */
    /* WHATSAPP BROADCAST TAB LOGIC                         */
    /* ---------------------------------------------------- */
    function initDefaultBroadcastTemplate() {
      if (el.bcCustomMessage) {
        el.bcCustomMessage.value = `Halo Kak {name},\n\nTerima kasih telah melamar posisi {role} di PGE Talent Pool.\n\nKami telah meninjau portofolio Kakak dan ingin mengundang Kakak untuk sesi Interview:\nðŸ“… Tanggal: {date}\nâ° Waktu: {time}\nðŸ“ Lokasi: {location}\n\nMohon konfirmasi kehadiran Kakak dengan membalas pesan ini ya. Terima kasih!\n- Tim HR PGE Talent Pool`;
      }
    }

    function handleBroadcastTemplateChange() {
      const tmpl = el.bcTemplateSelect ? el.bcTemplateSelect.value : 'interview';
      const msgBox = el.bcCustomMessage;
      if (!msgBox) return;

      if (tmpl === 'interview') {
        msgBox.value = `Halo Kak {name},\n\nTerima kasih telah melamar posisi {role} di PGE Talent Pool.\n\nKami telah meninjau portofolio Kakak dan ingin mengundang Kakak untuk sesi Interview:\nðŸ“… Tanggal: {date}\nâ° Waktu: {time}\nðŸ“ Lokasi: {location}\n\nMohon konfirmasi kehadiran Kakak dengan membalas pesan ini ya. Terima kasih!\n- Tim HR PGE Talent Pool`;
      } else if (tmpl === 'screening') {
        msgBox.value = `Halo Kak {name},\n\nKami dari Tim Rekrutmen PGE Talent Pool sedang meninjau aplikasi Kakak untuk posisi {role}.\n\nBisakah Kakak mengirimkan link portofolio video/desain terbaru dan konfirmasi kesiapan interview pada {date} pukul {time}?\n\nTerima kasih Kak!\n- Tim Rekrutmen PGE`;
      } else if (tmpl === 'offering') {
        msgBox.value = `Selamat Kak {name}! ðŸŽ‰\n\nBerdasarkan hasil evaluasi tim, Kakak telah terpilih untuk melanjutkan ke tahap penawaran kerja sama (Offering) posisi {role}.\n\nSesi penjelasan kontrak & onboarding akan dilaksanakan pada:\nðŸ“… Tanggal: {date}\nâ° Waktu: {time}\nðŸ“ Link/Tempat: {location}\n\nApakah Kakak siap bergabung?\n\nTerima kasih!\n- Management PGE Team`;
      } else {
        msgBox.value = `Halo Kak {name},\n\n`;
      }

      updateBroadcastPreview();
    }

    function insertVariableIntoMessage(variableTag) {
      const textarea = el.bcCustomMessage;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      textarea.value = text.substring(0, start) + variableTag + text.substring(end);
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + variableTag.length;
      updateBroadcastPreview();
    }

    function formatDisplayDate(dateStr) {
      if (!dateStr) return 'Besok';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    }

    function resolveCandidateMessage(talent) {
      const template = el.bcCustomMessage ? el.bcCustomMessage.value : '';
      const dateVal = formatDisplayDate(el.bcDateInput ? el.bcDateInput.value : '');
      const timeVal = el.bcTimeInput ? el.bcTimeInput.value.trim() : '10:00 WIB';
      const locVal = el.bcLocationInput ? el.bcLocationInput.value.trim() : 'Online Meet';

      return template
        .replace(/{name}/g, talent.name || 'Kandidat')
        .replace(/{role}/g, talent.role || 'Freelance Content Creator')
        .replace(/{date}/g, dateVal)
        .replace(/{time}/g, timeVal)
        .replace(/{location}/g, locVal)
        .replace(/{id}/g, talent.id || '');
    }

    function renderBroadcastTable() {
      if (!el.bcTableBody) return;
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';

      const targetTalents = state.talents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });

      if (state.broadcastSelectedIds.size === 0) {
        targetTalents.forEach(t => state.broadcastSelectedIds.add(t.id));
      }

      if (el.bcQueueCount) el.bcQueueCount.textContent = targetTalents.length;

      el.bcTableBody.innerHTML = targetTalents.map(talent => {
        const isSelected = state.broadcastSelectedIds.has(talent.id);
        const phone = formatToInternationalPhone(talent.phone);
        const resolvedMsg = resolveCandidateMessage(talent);
        const sentTime = state.broadcastSentHistory[talent.id];
        const isSent = !!sentTime;

        return `
          <tr>
            <td style="text-align: center;">
              <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleBroadcastSelect('${talent.id}')">
            </td>
            <td>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">${talent.id}</div>
              <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${escapeHtml(talent.name)}</div>
              <div style="font-size: 11px; color: var(--text-secondary);">${escapeHtml(talent.role || 'Freelance')} â€¢ ${escapeHtml(talent.domisili || '-')}</div>
            </td>
            <td>
              <span class="stage-select-pill stage-${(talent.stage || 'prospect').toLowerCase()}">${talent.stage || 'Prospect'}</span>
            </td>
            <td style="font-family: var(--font-mono); font-size: 12px;">
              ${phone ? `<span style="color: #166534; font-weight: 500;">${phone}</span>` : '<span style="color: #DC2626;">No WhatsApp</span>'}
            </td>
            <td style="max-width: 320px;">
              <div style="font-size: 11px; color: var(--text-secondary); background: #F9FAFB; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border-light); max-height: 55px; overflow-y: auto; white-space: pre-wrap; line-height: 1.4;">${escapeHtml(resolvedMsg)}</div>
            </td>
            <td style="text-align: right;">
              ${phone ? `
                <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                  ${isSent ? `
                    <span style="font-family: var(--font-mono); font-size: 11px; color: #16A34A; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;">
                      âœ“ Sent (${sentTime})
                    </span>
                  ` : '<span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">â³ Pending</span>'}
                  <button type="button" class="btn btn-wa btn-sm" onclick="sendBroadcastSingle('${talent.id}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Send to WA â†—
                  </button>
                </div>
              ` : '<span style="font-size: 11px; color: var(--text-muted);">Cannot send</span>'}
            </td>
          </tr>`;
      }).join('');
    }

    function updateBroadcastPreview() {
      if (state.currentView === 'broadcast') {
        renderBroadcastTable();
      }
    }

    function toggleBroadcastSelect(id) {
      if (state.broadcastSelectedIds.has(id)) {
        state.broadcastSelectedIds.delete(id);
      } else {
        state.broadcastSelectedIds.add(id);
      }
    }

    function toggleSelectAllBroadcast(isChecked) {
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';
      const targetTalents = state.talents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });

      if (isChecked) {
        targetTalents.forEach(t => state.broadcastSelectedIds.add(t.id));
      } else {
        state.broadcastSelectedIds.clear();
      }
      renderBroadcastTable();
    }

    async function sendBroadcastSingle(talentId) {
      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (!talent) return;
      const phone = formatToInternationalPhone(talent.phone);
      if (!phone) {
        showToast('Candidate does not have a valid WhatsApp number');
        return;
      }

      const msg = resolveCandidateMessage(talent);
      const cleanNum = phone.replace(/\+/g, '');
      const waUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`;

      window.open(waUrl, '_blank');

      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      state.broadcastSentHistory[talent.id] = nowTime;

      const autoUpdate = el.bcAutoUpdateStage && el.bcAutoUpdateStage.checked;
      if (autoUpdate) {
        const dateVal = formatDisplayDate(el.bcDateInput ? el.bcDateInput.value : '');
        const timeVal = el.bcTimeInput ? el.bcTimeInput.value.trim() : '10:00 WIB';
        const locVal = el.bcLocationInput ? el.bcLocationInput.value.trim() : 'Online Meet';
        
        const scheduleRemark = `\n[Interview Scheduled: ${dateVal} ${timeVal} @ ${locVal}]`;
        const updatedNotes = (talent.notes || '') + scheduleRemark;

        talent.stage = 'Interviewed';
        talent.notes = updatedNotes;

        try {
          const docId = talent.$id || (talent.id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            docId,
            {
              stage: 'Interviewed',
              notes: updatedNotes
            }
          );
          showToast(`âœ… Sent & Recorded Schedule for ${talent.name} in Appwrite!`);
        } catch (err) {
          console.warn('Auto-save schedule error:', err);
        }
      } else {
        showToast(`Opening WhatsApp for ${talent.name}...`);
      }

      renderBroadcastTable();
      updateMetrics();
    }

    /* ---------------------------------------------------- */
    /* CANDIDATE PROFILE SHOWCASE MODAL (2-COLUMN SPLIT)    */
    /* ---------------------------------------------------- */
    let currentProfileTalentId = null;

    function handleCandidateCardClick(id) {
      if (isSuperAdmin()) {
        openTalentDetail(id);
      } else {
        openCandidateProfileModal(id);
      }
    }

    function openCandidateDiscussion(id) {
      openCandidateProfileModal(id, 'discussion');
    }

    function switchProfileTab(tabName) {
      state.activeProfileTab = tabName;
      const btnPorto = document.getElementById('profTabBtnPorto');
      const btnDiscuss = document.getElementById('profTabBtnDiscuss');
      const contentPorto = document.getElementById('profTabPortoContent');
      const contentDiscuss = document.getElementById('profTabDiscussContent');

      if (btnPorto) btnPorto.classList.toggle('active', tabName === 'portfolio');
      if (btnDiscuss) btnDiscuss.classList.toggle('active', tabName === 'discussion');
      if (contentPorto) contentPorto.style.display = tabName === 'portfolio' ? 'flex' : 'none';
      if (contentDiscuss) {
        contentDiscuss.style.display = tabName === 'discussion' ? 'flex' : 'none';
        if (tabName === 'discussion' && state.activeProfileTalentId) {
          renderCandidateDiscussionMessages(state.activeProfileTalentId);
          setTimeout(() => {
            const stream = document.getElementById('candidateDiscussStream');
            if (stream) stream.scrollTop = stream.scrollHeight;
            const input = document.getElementById('candidateDiscussInput');
            if (input) input.focus();
          }, 50);
        }
      }
    }

    function selectDecisionTag(tagText) {
      if (state.selectedDecisionTag === tagText) {
        state.selectedDecisionTag = '';
      } else {
        state.selectedDecisionTag = tagText;
      }
      updateQuickDecisionPillsUI();
      const input = document.getElementById('candidateDiscussInput');
      if (input) input.focus();
    }

    function updateQuickDecisionPillsUI() {
      const container = document.getElementById('quickDecisionPillsContainer');
      if (!container) return;
      container.querySelectorAll('.quick-tag-chip').forEach(chip => {
        const text = chip.getAttribute('data-tag');
        const isSelected = (state.selectedDecisionTag === text);
        chip.style.fontWeight = isSelected ? '700' : '500';
        chip.style.borderColor = isSelected ? '#111827' : '#E5E7EB';
        chip.style.background = isSelected ? '#111827' : '#FFFFFF';
        chip.style.color = isSelected ? '#FFFFFF' : '#374151';
        chip.style.transform = isSelected ? 'scale(1.04)' : 'scale(1)';
      });
    }

    function renderCandidateDiscussionMessages(talentId) {
      const stream = document.getElementById('candidateDiscussStream');
      const countEl = document.getElementById('profModalDiscussCount');
      if (!stream) return;

      const talentData = state.candidateDiscussions[talentId];
      const messagesObj = (talentData && talentData.messages) ? talentData.messages : {};
      const list = Object.entries(messagesObj).map(([key, val]) => ({ key, ...val }));
      list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      if (countEl) countEl.textContent = list.length;

      if (list.length === 0) {
        const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
        const name = talent ? talent.name : 'Kandidat';
        stream.innerHTML = `
          <div style="background: #F9FAFB; border: 1px dashed var(--border-light); border-radius: var(--radius-sm); padding: 28px 16px; text-align: center; color: var(--text-muted); font-size: 12px; margin: auto 0;">
            <div style="font-size: 28px; margin-bottom: 8px;">ðŸ’¬</div>
            <div style="font-weight: 600; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Belum Ada Catatan Evaluasi Tim</div>
            <div>Bagikan catatan review, catatan interview, atau feedback untuk <strong>${escapeHtml(name)}</strong> di bawah ini.</div>
          </div>
        `;
        return;
      }

      const curEmail = state.currentUser ? (state.currentUser.email || '').toLowerCase().trim() : '';

      stream.innerHTML = list.map(msg => {
        const isAuthor = (msg.senderEmail || '').toLowerCase().trim() === curEmail;
        const canDelete = isAuthor || isSuperAdmin();
        const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '';
        const initial = (msg.senderName || msg.senderEmail || 'U').charAt(0).toUpperCase();

        let decisionTagHtml = '';
        if (msg.tag) {
          let pillClass = 'decision-pill-fit';
          if (msg.tag.includes('Kurang') || msg.tag.includes('Drop') || msg.tag.includes('Tolak')) pillClass = 'decision-pill-warn';
          else if (msg.tag.includes('Overbudget') || msg.tag.includes('Rate')) pillClass = 'decision-pill-rate';
          else if (msg.tag.includes('Aesthetic') || msg.tag.includes('Porto')) pillClass = 'decision-pill-art';
          else if (msg.tag.includes('Hubungi') || msg.tag.includes('Interview')) pillClass = 'decision-pill-call';

          decisionTagHtml = `<div class="discuss-decision-pill ${pillClass}">${escapeHtml(msg.tag)}</div>`;
        }

        return `
          <div class="discuss-card">
            <div class="discuss-header">
              <div class="discuss-author">
                <div class="discuss-author-avatar">${initial}</div>
                <span>${escapeHtml(msg.senderName || msg.senderEmail)}</span>
                <span class="discuss-role-badge ${msg.isSuperAdmin ? 'admin' : ''}">${msg.isSuperAdmin ? 'ðŸ‘‘ Admin' : 'HR'}</span>
              </div>
              <div class="discuss-time">${timeStr}</div>
            </div>
            ${decisionTagHtml}
            ${msg.text ? `<div class="discuss-text">${escapeHtml(msg.text)}</div>` : ''}
            ${canDelete ? `
              <div class="discuss-footer">
                <button type="button" class="discuss-delete-btn" onclick="handleDeleteCandidateComment('${talentId}', '${msg.key}')">Hapus Catatan</button>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      stream.scrollTop = stream.scrollHeight;
    }

    async function handleSendCandidateComment() {
      const talentId = state.activeProfileTalentId;
      if (!talentId || !state.currentUser) return;
      const input = document.getElementById('candidateDiscussInput');
      if (!input) return;
      const text = input.value.trim();
      const tag = state.selectedDecisionTag || '';

      if (!text && !tag) {
        showToast('Ketik catatan atau pilih tag evaluasi.');
        return;
      }

      const newMsg = {
        senderEmail: state.currentUser.email || 'anonymous',
        senderName: state.currentUser.displayName || state.currentUser.email || 'HR Member',
        senderPhoto: state.currentUser.photoURL || '',
        text: text,
        tag: tag,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        isSuperAdmin: isSuperAdmin()
      };

      try {
        input.value = '';
        state.selectedDecisionTag = '';
        updateQuickDecisionPillsUI();
        await rtdb.ref(`/candidate_discussions/${talentId}/messages`).push(newMsg);
        showToast('âœ… Catatan evaluasi tim tersimpan!');
        playChimeSound();
      } catch (err) {
        console.error('Send comment error:', err);
        showToast('Gagal menyimpan catatan: ' + err.message);
      }
    }

    async function handleDeleteCandidateComment(talentId, commentKey) {
      if (!confirm('Apakah Anda yakin ingin menghapus catatan evaluasi ini?')) return;
      try {
        await rtdb.ref(`/candidate_discussions/${talentId}/messages/${commentKey}`).remove();
        showToast('Catatan berhasil dihapus.');
      } catch (err) {
        showToast('Gagal menghapus catatan: ' + err.message);
      }
    }

    function openCandidateProfileModal(id, defaultTab = 'portfolio') {
      const talent = state.talents.find(t => t.id === id || t.$id === id);
      if (!talent) return;
      currentProfileTalentId = talent.id;
      state.activeProfileTalentId = talent.id;
      state.activeProfileTab = defaultTab;
      state.selectedDecisionTag = '';

      const modal = document.getElementById('candidateProfileModalBackdrop');
      const avatarEl = document.getElementById('profModalAvatar');
      const idEl = document.getElementById('profModalId');
      const stageBadgeEl = document.getElementById('profModalStageBadge');
      const ratingStarsEl = document.getElementById('profModalRatingStars');
      const nameEl = document.getElementById('profModalName');
      const adminEditBtn = document.getElementById('profModalAdminEditBtn');
      const leftCol = document.getElementById('profModalLeftCol');
      const rightCol = document.getElementById('profModalRightCol');

      if (!modal || !leftCol || !rightCol) return;

      // Header info
      const initials = (talent.name || 'Candidate').split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
      if (avatarEl) avatarEl.textContent = initials;
      if (idEl) idEl.textContent = talent.id;
      if (nameEl) nameEl.textContent = talent.name;
      if (ratingStarsEl) ratingStarsEl.textContent = 'â˜…'.repeat(talent.overallRating || 4);

      if (stageBadgeEl) {
        stageBadgeEl.textContent = talent.stage || 'Prospect';
        stageBadgeEl.className = 'stage-badge stage-' + (talent.stage || 'prospect').toLowerCase();
      }

      if (adminEditBtn) {
        adminEditBtn.style.display = isSuperAdmin() ? 'inline-flex' : 'none';
      }

      // Left Column: Details & Skill Matrix & WhatsApp
      const phoneClean = formatToInternationalPhone(talent.phone);
      const emailClean = cleanEmail(talent.email);
      const skills = talent.skills && talent.skills.length > 0 ? talent.skills : [
        { name: 'Foto', rating: 4 },
        { name: 'Video', rating: 4 },
        { name: 'Editing', rating: 4 },
        { name: 'Sense', rating: 4 }
      ];

      const skillsHtml = skills.map(s => {
        const pct = Math.round((Number(s.rating || 0) / 5) * 100);
        return `
          <div class="profile-skill-row">
            <div class="profile-skill-header">
              <span>${escapeHtml(s.name)}</span>
              <span style="font-family: var(--font-mono); font-weight: 600; color: #059669;">${s.rating} â˜… (${pct}%)</span>
            </div>
            <div class="profile-skill-track">
              <div class="profile-skill-fill" style="width: ${pct}%;"></div>
            </div>
          </div>`;
      }).join('');

      leftCol.innerHTML = `
        <div>
          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px;">
            Candidate Overview
          </div>
          <div class="profile-meta-item">
            <span>ðŸ’¼ <strong>Role:</strong></span>
            <span>${escapeHtml(talent.role || 'Freelance Content Creator')}</span>
          </div>
          <div class="profile-meta-item">
            <span>ðŸ“ˆ <strong>Level:</strong></span>
            <span>${escapeHtml(talent.experienceLevel || 'Junior')}</span>
          </div>
          <div class="profile-meta-item">
            <span>ðŸ“ <strong>Domisili:</strong></span>
            <span>${escapeHtml(talent.domisili || '-')}</span>
          </div>
          <div class="profile-meta-item">
            <span>ðŸŽ“ <strong>Pendidikan:</strong></span>
            <span>${escapeHtml(talent.education || '-')}</span>
          </div>
          <div class="profile-meta-item">
            <span>ðŸ’° <strong>Gaji/Uang Saku:</strong></span>
            <span>${escapeHtml(talent.expectedSalary || 'Standard Uang Saku')}</span>
          </div>
          <div class="profile-meta-item">
            <span>ðŸ“± <strong>WhatsApp:</strong></span>
            ${phoneClean ? `<a href="https://wa.me/${phoneClean.replace(/\+/g, '')}" target="_blank" style="color: #16A34A; font-weight: 600; font-family: var(--font-mono);">${phoneClean} â†—</a>` : '<span style="color: #9CA3AF;">-</span>'}
          </div>
          <div class="profile-meta-item">
            <span>âœ‰ï¸ <strong>Email:</strong></span>
            ${emailClean ? `<a href="mailto:${emailClean}" style="color: #2563EB; font-family: var(--font-mono); font-size: 11px;">${emailClean}</a>` : '<span style="color: #9CA3AF;">-</span>'}
          </div>
        </div>

        <div>
          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px;">
            Skill Benchmarking Matrix
          </div>
          <div style="background: #F9FAFB; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            ${skillsHtml}
          </div>
        </div>

        ${talent.notes ? `
          <div>
            <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">
              Notes &amp; Background
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); background: #F9FAFB; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); white-space: pre-wrap; line-height: 1.5; max-height: 110px; overflow-y: auto;">
              ${escapeHtml(talent.notes)}
            </div>
          </div>
        ` : ''}

        ${phoneClean ? `
          <a href="https://wa.me/${phoneClean.replace(/\+/g, '')}?text=${encodeURIComponent(`Halo Kak ${talent.name}, kami dari Tim HR PGE Talent Pool ingin mendiskusikan peluang kerja sama terkait posisi ${talent.role || 'Freelance Content Creator'}.`)}" target="_blank" class="btn btn-wa" style="width: 100%; justify-content: center; padding: 9px 14px; font-size: 12px; font-weight: 600; margin-top: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Contact via WhatsApp â†—
          </a>
        ` : ''}
      `;

      // Right Column: Tabbed Media Showcase & Team Discussion
      let cvBlockHtml = '';
      if (isValidDisplayUrl(talent.cvUrl)) {
        const cvHref = normalizeExternalUrl(talent.cvUrl);
        cvBlockHtml = `
          <div class="media-showcase-card" style="border-left: 4px solid #2563EB;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">ðŸ“„</span>
                <div>
                  <div style="font-weight: 600; font-size: 13px; color: var(--text-primary);">Curriculum Vitae (CV)</div>
                  <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Official Resume Document</div>
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <a href="${cvHref}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="font-size: 11px; padding: 5px 12px;">
                  Open CV Fullscreen â†—
                </a>
              </div>
            </div>
          </div>
        `;
      } else {
        cvBlockHtml = `
          <div style="background: #F9FAFB; border: 1px dashed var(--border-light); border-radius: var(--radius-sm); padding: 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
            ðŸ“„ Belum ada Curriculum Vitae (CV) yang dilampirkan.
          </div>
        `;
      }

      const validPortoList = (talent.portfolioItems || []).filter(p => isValidDisplayUrl(p.url));
      if (validPortoList.length === 0 && isValidDisplayUrl(talent.portfolioUrl)) {
        validPortoList.push({ name: 'Primary Portfolio Link', url: talent.portfolioUrl, type: 'document' });
      }

      let portoBlockHtml = '';
      if (validPortoList.length > 0) {
        portoBlockHtml = validPortoList.map((item, idx) => {
          const itemUrl = normalizeExternalUrl(item.url || '');
          const isVideo = itemUrl.includes('.mp4') || (item.type === 'video');
          const isCanva = itemUrl.includes('canva.site') || itemUrl.includes('canva.com');
          const isDrive = itemUrl.includes('drive.google.com');
          const isTiktok = itemUrl.includes('tiktok.com') || itemUrl.includes('vt.tiktok');
          const isYoutube = itemUrl.includes('youtube.com') || itemUrl.includes('youtu.be');

          if (isVideo) {
            return `
              <div class="media-showcase-card" style="border-left: 4px solid #7C3AED;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">ðŸŽ¬</span>
                    <div>
                      <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">${escapeHtml(item.name || `Video Portfolio #${idx + 1}`)}</div>
                      <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">MP4 Video Stream</div>
                    </div>
                  </div>
                  <a href="${itemUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="font-size: 10px; padding: 3px 8px;">
                    Download / Fullscreen â†—
                  </a>
                </div>
                <video controls style="width: 100%; border-radius: 6px; max-height: 240px; background: #000000; margin-top: 4px;">
                  <source src="${itemUrl}">
                  Browser Anda tidak mendukung tag video.
                </video>
              </div>`;
          }

          let badgeIcon = 'ðŸ“';
          let badgeColor = '#2563EB';
          let platformName = 'Document / Portfolio';

          if (isCanva) {
            badgeIcon = 'ðŸŽ¨';
            badgeColor = '#7C3AED';
            platformName = 'Canva Design Presentation';
          } else if (isDrive) {
            badgeIcon = 'â˜ï¸';
            badgeColor = '#059669';
            platformName = 'Google Drive Storage Folder';
          } else if (isTiktok) {
            badgeIcon = 'ðŸ“±';
            badgeColor = '#111827';
            platformName = 'TikTok Video / Reel Content';
          } else if (isYoutube) {
            badgeIcon = 'â–¶ï¸';
            badgeColor = '#DC2626';
            platformName = 'YouTube Video';
          }

          return `
            <div class="media-showcase-card" style="border-left: 4px solid ${badgeColor};">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">${badgeIcon}</span>
                  <div>
                    <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">${escapeHtml(item.name || `Portfolio Item #${idx + 1}`)}</div>
                    <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">${platformName}</div>
                  </div>
                </div>
                <a href="${itemUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="font-size: 11px; padding: 4px 10px; background: ${badgeColor}; border-color: ${badgeColor}; color: #FFFFFF;">
                  Buka Link Portofolio â†—
                </a>
              </div>
            </div>`;
        }).join('');
      } else {
        portoBlockHtml = `
          <div style="background: #F9FAFB; border: 1px dashed var(--border-light); border-radius: var(--radius-sm); padding: 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
            ðŸŽ¨ Belum ada item portofolio yang dilampirkan.
          </div>
        `;
      }

      const commentCount = (state.candidateDiscussions[talent.id] && state.candidateDiscussions[talent.id].messages) ? Object.keys(state.candidateDiscussions[talent.id].messages).length : (state.candidateCommentCounts[talent.id] || 0);

      rightCol.innerHTML = `
        <!-- Tab Navigation -->
        <div class="profile-tabs-nav">
          <button type="button" id="profTabBtnPorto" class="profile-tab-btn ${state.activeProfileTab === 'portfolio' ? 'active' : ''}" onclick="switchProfileTab('portfolio')">
            ðŸ“ Portfolio &amp; CV (${validPortoList.length + (isValidDisplayUrl(talent.cvUrl) ? 1 : 0)})
          </button>
          <button type="button" id="profTabBtnDiscuss" class="profile-tab-btn ${state.activeProfileTab === 'discussion' ? 'active' : ''}" onclick="switchProfileTab('discussion')">
            ðŸ’¬ Tim Diskusi &amp; Evaluasi (<span id="profModalDiscussCount">${commentCount}</span>)
          </button>
        </div>

        <!-- Tab 1: Portfolio & CV Content -->
        <div id="profTabPortoContent" style="display: ${state.activeProfileTab === 'portfolio' ? 'flex' : 'none'}; flex-direction: column; gap: 20px;">
          <div>
            <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px;">
              1. Curriculum Vitae Document
            </div>
            ${cvBlockHtml}
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600;">
                2. Creative Portfolio Works &amp; Media (${validPortoList.length})
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${portoBlockHtml}
            </div>
          </div>
        </div>

        <!-- Tab 2: Candidate Discussion & Team Evaluation Content -->
        <div id="profTabDiscussContent" class="discussion-container" style="display: ${state.activeProfileTab === 'discussion' ? 'flex' : 'none'};">
          <!-- Preset Quick Decision Pills Bar -->
          <div>
            <div style="font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">
              Quick Decision Tag:
            </div>
            <div class="quick-decision-bar" id="quickDecisionPillsContainer">
              <span class="quick-tag-chip tag-fit" data-tag="âœ… Strong Fit" onclick="selectDecisionTag('âœ… Strong Fit')">âœ… Strong Fit</span>
              <span class="quick-tag-chip tag-fit" data-tag="â­ Prioritas Interview" onclick="selectDecisionTag('â­ Prioritas Interview')">â­ Prioritas Interview</span>
              <span class="quick-tag-chip tag-art" data-tag="ðŸŽ¨ Aesthetic Bagus" onclick="selectDecisionTag('ðŸŽ¨ Aesthetic Bagus')">ðŸŽ¨ Aesthetic Bagus</span>
              <span class="quick-tag-chip tag-warn" data-tag="âš ï¸ Portofolio Kurang" onclick="selectDecisionTag('âš ï¸ Portofolio Kurang')">âš ï¸ Portofolio Kurang</span>
              <span class="quick-tag-chip tag-rate" data-tag="ðŸ’° Overbudget" onclick="selectDecisionTag('ðŸ’° Overbudget')">ðŸ’° Overbudget</span>
              <span class="quick-tag-chip" data-tag="ðŸ“ž Hubungi Segera" onclick="selectDecisionTag('ðŸ“ž Hubungi Segera')">ðŸ“ž Hubungi Segera</span>
            </div>
          </div>

          <!-- Discussion Stream -->
          <div class="discussion-list-stream" id="candidateDiscussStream"></div>

          <!-- Composer Box -->
          <form class="discuss-composer-box" onsubmit="event.preventDefault(); handleSendCandidateComment();">
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="text" id="candidateDiscussInput" class="form-input" placeholder="Tulis catatan evaluasi tim... (Tekan Enter)" style="flex: 1; font-size: 12px; padding: 8px 12px;" autocomplete="off">
              <button type="submit" class="btn btn-primary btn-sm" style="padding: 8px 14px; font-size: 12px; font-weight: 600; white-space: nowrap;">
                + Simpan Catatan
              </button>
            </div>
          </form>
        </div>
      `;

      modal.classList.add('open');

      if (state.activeProfileTab === 'discussion') {
        renderCandidateDiscussionMessages(talent.id);
      }
    }

    function closeCandidateProfileModal() {
      const modal = document.getElementById('candidateProfileModalBackdrop');
      if (modal) {
        modal.classList.remove('open');
        modal.querySelectorAll('video').forEach(v => v.pause());
      }
      currentProfileTalentId = null;
      state.activeProfileTalentId = null;
    }

    function switchToEditDrawer() {
      const targetId = currentProfileTalentId;
      closeCandidateProfileModal();
      if (targetId) {
        openTalentDetail(targetId);
      }
    }

    /* ---------------------------------------------------- */
    /* DRAWER LOGIC (SUPER ADMIN ONLY)                      */
    /* ---------------------------------------------------- */
    function openDrawer() {
      document.body.classList.add('drawer-open');
      if (el.talentDrawer) el.talentDrawer.classList.add('open');
      if (el.drawerBackdrop) el.drawerBackdrop.classList.add('active');
    }

    function closeDrawer() {
      document.body.classList.remove('drawer-open');
      if (el.talentDrawer) el.talentDrawer.classList.remove('open');
      if (el.drawerBackdrop) el.drawerBackdrop.classList.remove('active');
      state.selectedTalent = null;
      state.stagedPortfolioItems = [];
    }

    function openTalentDetail(id) {
      if (!isSuperAdmin()) {
        openCandidateProfileModal(id);
        return;
      }
      const talent = state.talents.find(t => t.id === id || t.$id === id);
      if (!talent) return;
      state.selectedTalent = talent;
      state.stagedPortfolioItems = talent.portfolioItems ? [...talent.portfolioItems] : (isValidDisplayUrl(talent.portfolioUrl) ? [{ name: 'Portfolio Link', url: talent.portfolioUrl, type: 'document' }] : []);

      if (el.drawerId) el.drawerId.textContent = talent.id;
      if (el.drawerTitle) el.drawerTitle.textContent = talent.name;
      if (el.btnDeleteDrawer) el.btnDeleteDrawer.style.display = isSuperAdmin() ? 'inline-flex' : 'none';

      renderDrawerForm(talent);
      openDrawer();
    }

    function openAddCandidateDrawer() {
      if (!isSuperAdmin()) {
        showToast('âš ï¸ Only Super Admin (hrdcvpge@gmail.com) is authorized to add new candidates.');
        return;
      }

      state.selectedTalent = null;
      state.stagedPortfolioItems = [];
      const nextId = 'PGE-' + String(state.talents.length + 1).padStart(3, '0');

      const defaultRole = (state.activeVacancy && state.activeVacancy !== 'HUB' && state.activeVacancy !== 'ALL')
        ? state.activeVacancy
        : 'Freelance Content Creator';

      if (el.drawerId) el.drawerId.textContent = nextId + ' (New)';
      if (el.drawerTitle) el.drawerTitle.textContent = 'Add New Candidate';
      if (el.btnDeleteDrawer) el.btnDeleteDrawer.style.display = 'none';

      renderDrawerForm({
        id: nextId,
        name: '',
        role: defaultRole,
        phone: '',
        email: '',
        experienceLevel: 'Junior',
        overallRating: 4,
        stage: 'Prospect',
        expectedSalary: 'Standard Uang Saku',
        domisili: '',
        education: '',
        notes: '',
        cvUrl: '',
        portfolioUrl: '',
        skills: [
          { name: 'Foto Produk', rating: 4 },
          { name: 'Video Produk', rating: 4 },
          { name: 'Video Editing', rating: 4 },
          { name: 'Content Sense', rating: 4 }
        ]
      });
      openDrawer();
    }

    function renderDrawerForm(data) {
      if (!el.drawerBody) return;
      const uniqueRoles = Array.from(new Set(state.talents.map(t => (t.role || '').trim()).filter(Boolean)));
      const datalistOptions = uniqueRoles.map(r => `<option value="${escapeHtml(r)}"></option>`).join('');

      el.drawerBody.innerHTML = `
        <form id="talentForm" onsubmit="event.preventDefault(); handleSaveCandidate();">
          <div class="form-group">
            <label class="form-label">
              <span>Full Name *</span>
              <span style="font-size: 10px; color: #2563EB; font-weight: normal;">Auto Title Case</span>
            </label>
            <input type="text" id="inputName" class="form-input" value="${escapeHtml(data.name || '')}" placeholder="e.g. Budi Santoso" required onblur="handleNameBlur(this)" oninput="checkDuplicateLive()">
            <div id="duplicateWarningName" class="duplicate-warning-box"></div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">
                <span>Role / Job Vacancy *</span>
                <span style="font-size: 10px; color: #2563EB; font-weight: normal;">Datalist / Custom</span>
              </label>
              <input type="text" id="inputRole" list="registeredRolesList" class="form-input" value="${escapeHtml(data.role || 'Freelance Content Creator')}" placeholder="Pilih atau ketik nama lowongan..." onblur="this.value = toTitleCase(this.value)">
              <datalist id="registeredRolesList">
                ${datalistOptions}
              </datalist>
            </div>
            <div class="form-group">
              <label class="form-label">Experience Level</label>
              <select id="inputLevel" class="form-select">
                <option value="Junior" ${data.experienceLevel === 'Junior' ? 'selected' : ''}>Junior</option>
                <option value="Mid" ${data.experienceLevel === 'Mid' ? 'selected' : ''}>Mid-Level</option>
                <option value="Senior" ${data.experienceLevel === 'Senior' ? 'selected' : ''}>Senior</option>
                <option value="Lead" ${data.experienceLevel === 'Lead' ? 'selected' : ''}>Lead / Specialist</option>
              </select>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">
                <span>Domisili / Location</span>
                <span style="font-size: 10px; color: #2563EB; font-weight: normal;">Auto Title Case</span>
              </label>
              <input type="text" id="inputDomisili" class="form-input" value="${escapeHtml(data.domisili || '')}" placeholder="e.g. Surakarta" onblur="this.value = toTitleCase(this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">
                <span>Education / Background</span>
                <span style="font-size: 10px; color: #2563EB; font-weight: normal;">Auto Format</span>
              </label>
              <input type="text" id="inputEducation" class="form-input" value="${escapeHtml(data.education || '')}" placeholder="e.g. S1 DKV / SMA" onblur="this.value = cleanEducation(this.value)">
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">
                <span>WhatsApp Number</span>
                <span style="font-size: 10px; color: #16A34A; font-weight: normal;">Auto +62 Format</span>
              </label>
              <input type="text" id="inputPhone" class="form-input" value="${escapeHtml(data.phone || '')}" placeholder="08123456789" onblur="handlePhoneBlur(this)" oninput="checkDuplicateLive()">
              <div id="duplicateWarningPhone" class="duplicate-warning-box"></div>
            </div>
            <div class="form-group">
              <label class="form-label">
                <span>Email Address</span>
                <span style="font-size: 10px; color: var(--text-muted); font-weight: normal;">Auto Lowercase</span>
              </label>
              <input type="email" id="inputEmail" class="form-input" value="${escapeHtml(data.email || '')}" placeholder="candidate@example.com" onblur="this.value = cleanEmail(this.value)">
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Overall Rating (1-5)</label>
              <select id="inputOverallRating" class="form-select">
                <option value="5" ${data.overallRating === 5 ? 'selected' : ''}>5 - Exceptional â˜…â˜…â˜…â˜…â˜…</option>
                <option value="4" ${data.overallRating === 4 ? 'selected' : ''}>4 - Proficient â˜…â˜…â˜…â˜…â˜†</option>
                <option value="3" ${data.overallRating === 3 ? 'selected' : ''}>3 - Standard â˜…â˜…â˜…â˜†â˜†</option>
                <option value="2" ${data.overallRating === 2 ? 'selected' : ''}>2 - Developing â˜…â˜…â˜†â˜†â˜†</option>
                <option value="1" ${data.overallRating === 1 ? 'selected' : ''}>1 - Novice â˜…â˜†â˜†â˜†â˜†</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Pipeline Stage</label>
              <select id="inputStage" class="form-select">
                ${STAGES.map(st => `<option value="${st}" ${data.stage === st ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Expected Salary / Rate</label>
            <input type="text" id="inputSalary" class="form-input" value="${escapeHtml(data.expectedSalary || 'Standard Uang Saku')}" placeholder="e.g. Standard Uang Saku, Rp 3.500.000 / project">
          </div>

          <!-- Quick Tagging Bar -->
          <div class="form-group">
            <label class="form-label">Quick Recruitment Tags (1-Click Add):</label>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <span class="quick-tag-btn" onclick="addQuickTag('Siap Kerja')">+ Siap Kerja</span>
              <span class="quick-tag-btn" onclick="addQuickTag('Remote Ready')">+ Remote Ready</span>
              <span class="quick-tag-btn" onclick="addQuickTag('Full-Time Ready')">+ Full-Time Ready</span>
              <span class="quick-tag-btn" onclick="addQuickTag('Video Specialist')">+ Video Specialist</span>
              <span class="quick-tag-btn" onclick="addQuickTag('Fast Response')">+ Fast Response</span>
              <span class="quick-tag-btn" onclick="addQuickTag('Top Talent PGE')">+ Top Talent</span>
            </div>
          </div>

          <!-- Dynamic Skill Builder -->
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" style="margin-bottom: 0;">Skill Ratings</label>
              <button type="button" class="btn btn-secondary btn-sm" onclick="addSkillRow()" style="padding: 2px 8px; font-size: 11px;">+ Add Skill</button>
            </div>
            <div id="skillsBuilderContainer">
              ${(data.skills || []).map(s => `
                <div class="skills-builder-row">
                  <input type="text" class="form-input skill-name-input" value="${escapeHtml(s.name)}" placeholder="Skill name" style="flex: 1;" onblur="this.value = toTitleCase(this.value)">
                  <select class="form-select skill-rating-select" style="width: 90px;">
                    <option value="5" ${s.rating === 5 ? 'selected' : ''}>5 â˜…</option>
                    <option value="4" ${s.rating === 4 ? 'selected' : ''}>4 â˜…</option>
                    <option value="3" ${s.rating === 3 ? 'selected' : ''}>3 â˜…</option>
                    <option value="2" ${s.rating === 2 ? 'selected' : ''}>2 â˜…</option>
                    <option value="1" ${s.rating === 1 ? 'selected' : ''}>1 â˜…</option>
                  </select>
                  <button type="button" class="btn btn-secondary btn-icon" onclick="this.closest('.skills-builder-row').remove()" style="color: var(--pastel-red-text);">âœ•</button>
                </div>`).join('')}
            </div>
          </div>

          <!-- ============================================== -->
          <!-- 1. SEPARATED CV / RESUME UPLOAD SECTION (APPWRITE) -->
          <!-- ============================================== -->
          <div class="upload-section-box">
            <div class="upload-section-title">
              <span>ðŸ“„ 1. Curriculum Vitae (CV / Resume)</span>
              <span style="font-size: 10px; color: #2563EB; font-weight: 500;">Appwrite Native Cloud Stream</span>
            </div>

            <div class="dropzone-box" id="cvDropzone"
                 onclick="document.getElementById('inputCvFileInput').click()"
                 ondragover="handleCvDragOver(event)"
                 ondragenter="handleCvDragEnter(event)"
                 ondragleave="handleCvDragLeave(event)"
                 ondrop="handleCvDrop(event)">
              <input type="file" id="inputCvFileInput" accept=".pdf,.doc,.docx,image/*" style="display: none;" onchange="handleCvFileSelect(event)">
              <div class="dropzone-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">
                Drop CV file here, or <span style="color: #2563EB; text-decoration: underline;">browse</span>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                PDF, Word doc, or scanned document (Auto-compressed if &gt;25MB)
              </div>
            </div>

            <!-- Persistent Attached CV Container -->
            <div id="cvAttachedContainer"></div>

            <!-- CV Upload Progress -->
            <div class="upload-queue-container" id="cvUploadQueue"></div>

            <!-- CV Link URL Input -->
            <div style="margin-top: 10px;">
              <label class="form-label" style="font-size: 10px; color: var(--text-muted); margin-bottom: 3px;">Or Paste CV Cloud Link:</label>
              <input type="text" id="inputCvUrl" class="form-input" value="${escapeHtml(data.cvUrl || '')}" placeholder="https://..." oninput="handleManualCvUrlChange(this.value)">
            </div>
          </div>

          <!-- ============================================== -->
          <!-- 2. SEPARATED PORTFOLIO UPLOAD SECTION (APPWRITE) -->
          <!-- ============================================== -->
          <div class="upload-section-box">
            <div class="upload-section-title">
              <span>ðŸŽ¬ 2. Portfolio &amp; Creative Media</span>
              <span style="font-size: 10px; color: #7C3AED; font-weight: 500;">Appwrite High-Speed Stream (Auto-Compress Supported)</span>
            </div>

            <div class="dropzone-box" id="portoDropzone"
                 onclick="document.getElementById('inputPortoFileInput').click()"
                 ondragover="handlePortoDragOver(event)"
                 ondragenter="handlePortoDragEnter(event)"
                 ondragleave="handlePortoDragLeave(event)"
                 ondrop="handlePortoDrop(event)">
              <input type="file" id="inputPortoFileInput" multiple accept="video/*,image/*,.pdf,.zip" style="display: none;" onchange="handlePortoFileSelect(event)">
              <div class="dropzone-icon" style="color: #7C3AED; background: #FAF5FF;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">
                Drop Portfolio files here, or <span style="color: #7C3AED; text-decoration: underline;">browse multiple</span>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                MP4 Videos, Reels, Large Portfolios, PDFs (Auto-compressed if &gt;25MB)
              </div>
            </div>

            <!-- Portfolio Upload Progress -->
            <div class="upload-queue-container" id="portoUploadQueue"></div>

            <!-- Attached Portfolio Media Chips List (Persistent) -->
            <div style="margin-top: 10px;">
              <label class="form-label" style="font-size: 10px; color: var(--text-muted); margin-bottom: 3px;">Attached Portfolio Items:</label>
              <div class="portfolio-chips" id="portfolioFilesContainer"></div>
              <div style="display: flex; gap: 6px; margin-top: 6px;">
                <input type="text" id="inputManualPortoUrl" class="form-input" placeholder="Or paste Canva, Drive folder, TikTok, YouTube link...">
                <button type="button" class="btn btn-secondary btn-sm" onclick="addManualPortoLink()">Add Link</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Notes &amp; Remarks</label>
            <textarea id="inputNotes" class="form-textarea" rows="3" placeholder="Add interview remarks, background notes, source... ">${escapeHtml(data.notes || '')}</textarea>
          </div>
        </form>`;

      if (isValidDisplayUrl(data.cvUrl)) {
        renderAttachedCvCard(data.cvUrl);
      }
      renderPortfolioChips();
      renderDrawerUploadQueues();
    }

    function handleNameBlur(input) {
      if (input && input.value) {
        input.value = toTitleCase(input.value);
      }
    }

    function handlePhoneBlur(input) {
      if (input && input.value) {
        input.value = formatToInternationalPhone(input.value);
      }
    }

    /* Smart Duplicate Checker */
    function checkDuplicateLive() {
      const nameInput = document.getElementById('inputName');
      const phoneInput = document.getElementById('inputPhone');
      const warnName = document.getElementById('duplicateWarningName');
      const warnPhone = document.getElementById('duplicateWarningPhone');

      const curName = (nameInput ? nameInput.value.trim().toLowerCase() : '');
      const curPhone = (phoneInput ? formatToInternationalPhone(phoneInput.value.trim()) : '');
      const curId = state.selectedTalent ? state.selectedTalent.id : null;

      if (curPhone && curPhone.length > 7 && warnPhone) {
        const matchPh = state.talents.find(t => t.id !== curId && t.phone && formatToInternationalPhone(t.phone) === curPhone);
        if (matchPh) {
          warnPhone.style.display = 'flex';
          warnPhone.innerHTML = `âš ï¸ Duplicate Phone! Already belongs to <strong>[${matchPh.id}] ${escapeHtml(matchPh.name)}</strong>`;
        } else {
          warnPhone.style.display = 'none';
        }
      } else if (warnPhone) {
        warnPhone.style.display = 'none';
      }

      if (curName && curName.length > 3 && warnName) {
        const matchNm = state.talents.find(t => t.id !== curId && t.name && t.name.toLowerCase() === curName);
        if (matchNm) {
          warnName.style.display = 'flex';
          warnName.innerHTML = `âš ï¸ Duplicate Name! Candidate <strong>[${matchNm.id}] ${escapeHtml(matchNm.name)}</strong> already exists.`;
        } else {
          warnName.style.display = 'none';
        }
      } else if (warnName) {
        warnName.style.display = 'none';
      }
    }

    function addQuickTag(tagName) {
      const container = document.getElementById('skillsBuilderContainer');
      if (!container) return;
      const existing = Array.from(container.querySelectorAll('.skill-name-input')).find(i => i.value.toLowerCase() === tagName.toLowerCase());
      if (existing) {
        showToast(`Tag "${tagName}" already added!`);
        return;
      }
      const row = document.createElement('div');
      row.className = 'skills-builder-row';
      row.innerHTML = `
        <input type="text" class="form-input skill-name-input" value="${escapeHtml(tagName)}" style="flex: 1;">
        <select class="form-select skill-rating-select" style="width: 90px;">
          <option value="5" selected>5 â˜…</option>
          <option value="4">4 â˜…</option>
          <option value="3">3 â˜…</option>
        </select>
        <button type="button" class="btn btn-secondary btn-icon" onclick="this.closest('.skills-builder-row').remove()" style="color: var(--pastel-red-text);">âœ•</button>`;
      container.appendChild(row);
      showToast(`Added tag "${tagName}"!`);
    }

    /* ---------------------------------------------------- */
    /* CANDIDATE COMPARISON MATRIX                          */
    /* ---------------------------------------------------- */
    function toggleCompareCandidate(id) {
      if (state.comparedTalentIds.has(id)) {
        state.comparedTalentIds.delete(id);
      } else {
        if (state.comparedTalentIds.size >= 3) {
          showToast('You can compare a maximum of 3 candidates at once');
          return;
        }
        state.comparedTalentIds.add(id);
      }
      updateCompareBar();
      renderActiveView();
    }

    function updateCompareBar() {
      const count = state.comparedTalentIds.size;
      if (el.compareCount) el.compareCount.textContent = count;
      if (el.compareBar) {
        el.compareBar.classList.toggle('active', count > 0);
      }
    }

    function clearComparison() {
      state.comparedTalentIds.clear();
      updateCompareBar();
      renderActiveView();
    }

    function openComparisonModal() {
      const ids = Array.from(state.comparedTalentIds);
      if (!ids.length) return;
      const talents = ids.map(id => state.talents.find(t => t.id === id || t.$id === id)).filter(Boolean);

      const body = el.compareModalBody;
      if (!body) return;

      body.innerHTML = `
        <div style="overflow-x: auto;">
          <table class="data-table" style="border: 1px solid var(--border-light); width: 100%;">
            <thead>
              <tr>
                <th style="width: 140px; background: #F9FAFB;">Feature</th>
                ${talents.map(t => `<th style="text-align: center; background: #FFFFFF; border-left: 1px solid var(--border-light); width: ${100 / talents.length}%;">
                  <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">${t.id}</div>
                  <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${escapeHtml(t.name)}</div>
                  <div style="font-size: 11px; color: var(--text-secondary); font-weight: normal;">${escapeHtml(t.role || 'Freelance')}</div>
                </th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Overall Rating</td>
                ${talents.map(t => `<td style="text-align: center; border-left: 1px solid var(--border-light);"><span class="rating-badge">â˜… ${(t.overallRating || 4).toFixed(1)}</span></td>`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Pipeline Stage</td>
                ${talents.map(t => `<td style="text-align: center; border-left: 1px solid var(--border-light);"><span class="stage-select-pill stage-${(t.stage || 'prospect').toLowerCase()}">${t.stage || 'Prospect'}</span></td>`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Experience Level</td>
                ${talents.map(t => `<td style="text-align: center; border-left: 1px solid var(--border-light);">${t.experienceLevel || 'Junior'}</td>`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Domisili / Location</td>
                ${talents.map(t => `<td style="text-align: center; border-left: 1px solid var(--border-light);">${escapeHtml(t.domisili || '-')}</td>`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Education</td>
                ${talents.map(t => `<td style="text-align: center; border-left: 1px solid var(--border-light); font-size: 12px;">${escapeHtml(t.education || '-')}</td>`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Expected Rate</td>
                ${talents.map(t => `<td style="text-align: center; border-left: 1px solid var(--border-light); font-family: var(--font-mono); font-size: 11px;">${escapeHtml(t.expectedSalary || 'Standard')}</td>`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Skill Breakdown</td>
                ${talents.map(t => `
                  <td style="border-left: 1px solid var(--border-light); vertical-align: top; padding: 10px;">
                    ${(t.skills || []).map(s => `<div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; padding: 2px 4px; background: #F3F4F6; border-radius: 4px;">
                      <span>${escapeHtml(s.name)}</span>
                      <span style="font-weight: 600; color: #D97706;">â˜… ${s.rating}</span>
                    </div>`).join('')}
                  </td>`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Quick Actions</td>
                ${talents.map(t => `
                  <td style="text-align: center; border-left: 1px solid var(--border-light); padding: 12px;">
                    <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
                      ${isValidDisplayUrl(t.cvUrl) ? `<a href="${normalizeExternalUrl(t.cvUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="font-size: 11px;">CV â†—</a>` : ''}
                      ${t.phone ? `<a href="https://wa.me/${formatToInternationalPhone(t.phone).replace(/\+/g, '')}" target="_blank" rel="noopener noreferrer" class="btn btn-wa btn-sm" style="font-size: 11px;">ðŸ’¬ WA</a>` : ''}
                    </div>
                  </td>`).join('')}
              </tr>
            </tbody>
          </table>
        </div>`;

      if (el.compareModalBackdrop) el.compareModalBackdrop.classList.add('open');
    }

    function closeComparisonModal() {
      if (el.compareModalBackdrop) el.compareModalBackdrop.classList.remove('open');
    }

    /* ---------------------------------------------------- */
    /* MULTI-PORTFOLIO GALLERY MODAL                        */
    /* ---------------------------------------------------- */
    function openPortoGalleryModal(id) {
      const talent = state.talents.find(t => t.id === id || t.$id === id);
      if (!talent) return;

      const titleEl = document.getElementById('portoGalleryCandidateName');
      if (titleEl) titleEl.textContent = `${talent.name} (${talent.id})`;

      const bodyEl = document.getElementById('portoGalleryModalBody');
      if (!bodyEl) return;

      const items = talent.portfolioItems && talent.portfolioItems.length ? talent.portfolioItems : (isValidDisplayUrl(talent.portfolioUrl) ? [{ name: 'Portfolio Link', url: talent.portfolioUrl, type: 'document' }] : []);

      if (!items.length) {
        bodyEl.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">No portfolio attachments found.</div>';
      } else {
        bodyEl.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${items.map((item, idx) => {
              const targetHref = normalizeExternalUrl(item.url || '');
              const isVid = item.type === 'video' || (targetHref && targetHref.toLowerCase().includes('.mp4'));
              const isImg = item.type === 'image';
              const icon = isVid ? 'ðŸŽ¬' : (isImg ? 'ðŸ–¼ï¸' : 'ðŸ“„');

              return `
                <div style="background: #F9FAFB; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 14px; display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; color: var(--text-primary); max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      <span>${icon}</span>
                      <span>${escapeHtml(item.name || `Portfolio Item #${idx + 1}`)}</span>
                    </div>
                    <a href="${targetHref}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="font-size: 11px;">
                      Open / Download â†—
                    </a>
                  </div>
                  ${isVid && !targetHref.includes('drive.google') && !targetHref.includes('canva') && !targetHref.includes('tiktok') ? `
                    <div style="margin-top: 6px; border-radius: 6px; overflow: hidden; background: #000;">
                      <video src="${targetHref}" controls style="width: 100%; max-height: 280px; display: block;"></video>
                    </div>
                  ` : ''}
                </div>`;
            }).join('')}
          </div>`;
      }

      const modal = document.getElementById('portoGalleryModalBackdrop');
      if (modal) modal.classList.add('open');
    }

    function closePortoGalleryModal() {
      const modal = document.getElementById('portoGalleryModalBackdrop');
      if (modal) modal.classList.remove('open');
    }

    /* ---------------------------------------------------- */
    /* TEAM WHITELIST MANAGER MODAL                         */
    /* ---------------------------------------------------- */
    function openWhitelistModal() {
      renderWhitelistItems();
      const modal = document.getElementById('whitelistModalBackdrop');
      if (modal) modal.classList.add('open');
    }

    function closeWhitelistModal() {
      const modal = document.getElementById('whitelistModalBackdrop');
      if (modal) modal.classList.remove('open');
    }

    function formatTimeAgo(timestamp) {
      if (!timestamp) return 'Never';
      const diffSec = Math.floor((Date.now() - timestamp) / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDay = Math.floor(diffHr / 24);
      return `${diffDay}d ago`;
    }

    function renderWhitelistItems() {
      const container = document.getElementById('whitelistItemsContainer');
      if (!container) return;

      const customList = getCustomWhitelist();
      let html = '';

      // Super Admins with Live Presence
      SUPER_ADMIN_EMAILS.forEach(email => {
        const safeKey = email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const pres = state.presenceData ? state.presenceData[safeKey] : null;
        const isOnline = pres && pres.status === 'online';

        html += `
          <div style="display: flex; justify-content: space-between; align-items: center; background: #F3F4F6; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 14px;">ðŸ‘‘</span>
              <div>
                <div style="font-weight: 600; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary);">${escapeHtml(email)}</div>
                <div style="margin-top: 2px;">
                  ${isOnline ? `
                    <span style="color: #16A34A; font-weight: 600; font-size: 10px; font-family: var(--font-mono); display: inline-flex; align-items: center; gap: 4px;">
                      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #16A34A; box-shadow: 0 0 5px #16A34A;"></span> Online Now
                    </span>
                  ` : (pres && pres.lastActive ? `
                    <span style="color: var(--text-muted); font-size: 10px; font-family: var(--font-mono);">Last active: ${formatTimeAgo(pres.lastActive)}</span>
                  ` : '<span style="color: var(--text-muted); font-size: 10px; font-family: var(--font-mono); font-style: italic;">Offline</span>')}
                </div>
              </div>
            </div>
            <span class="brand-badge" style="background: #FEF3C7; color: #92400E; border-color: #FDE68A;">Super Admin</span>
          </div>`;
      });

      // Domain Wildcards
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #F0FDF4; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid #DCFCE7;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px;">ðŸ¢</span>
            <div>
              <div style="font-weight: 500; font-family: var(--font-mono); font-size: 12px; color: #166534;">*@pge.co.id &amp; *@pertamina.com</div>
              <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">Domain Auto-Authorize</div>
            </div>
          </div>
          <span class="brand-badge">Org Domain</span>
        </div>`;

      // Custom Added Emails with Live Presence
      customList.forEach(email => {
        const safeKey = email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const pres = state.presenceData ? state.presenceData[safeKey] : null;
        const isOnline = pres && pres.status === 'online';

        html += `
          <div style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 14px;">ðŸ‘¤</span>
              <div>
                <div style="font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); font-weight: 500;">${escapeHtml(email)}</div>
                <div style="margin-top: 2px;">
                  ${isOnline ? `
                    <span style="color: #16A34A; font-weight: 600; font-size: 10px; font-family: var(--font-mono); display: inline-flex; align-items: center; gap: 4px;">
                      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #16A34A; box-shadow: 0 0 5px #16A34A;"></span> Online Now
                    </span>
                  ` : (pres && pres.lastActive ? `
                    <span style="color: var(--text-muted); font-size: 10px; font-family: var(--font-mono);">Last active: ${formatTimeAgo(pres.lastActive)}</span>
                  ` : '<span style="color: var(--text-muted); font-size: 10px; font-family: var(--font-mono); font-style: italic;">Offline</span>')}
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="handleRemoveWhitelistEmail('${escapeHtml(email)}')" style="color: var(--pastel-red-text); padding: 2px 8px; font-size: 11px;">
              Remove âœ•
            </button>
          </div>`;
      });

      container.innerHTML = html;
    }

    function handleAddWhitelistEmail() {
      const input = document.getElementById('inputNewWhitelistEmail');
      if (!input) return;
      const email = input.value.toLowerCase().trim();
      if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address');
        return;
      }

      if (SUPER_ADMIN_EMAILS.includes(email) || email.endsWith('@pge.co.id') || email.endsWith('@pertamina.com')) {
        showToast('This email is already authorized by default!');
        return;
      }

      const list = getCustomWhitelist();
      if (list.includes(email)) {
        showToast('This email is already in the whitelist!');
        return;
      }

      list.push(email);
      saveCustomWhitelist(list);
      input.value = '';
      renderWhitelistItems();
      showToast(`Added ${email} to whitelist!`);
    }

    function handleRemoveWhitelistEmail(email) {
      if (!confirm(`Remove ${email} from whitelist?`)) return;
      let list = getCustomWhitelist();
      list = list.filter(e => e.toLowerCase() !== email.toLowerCase());
      saveCustomWhitelist(list);
      renderWhitelistItems();
      showToast(`Removed ${email} from whitelist.`);
    }

    /* ---------------------------------------------------- */
    /* REALTIME TEAM MESSENGER                              */
    /* ---------------------------------------------------- */
    let messengerOpen = false;
    let messengerCurrentTab = 'chat';
    let unreadCount = 0;

    function toggleTeamMessenger() {
      messengerOpen = !messengerOpen;
      const panel = document.getElementById('messengerPanel');
      if (panel) {
        if (messengerOpen) {
          panel.classList.add('open');
          markChatAsRead();
          renderMessengerMembers();
          if (messengerCurrentTab === 'chat') {
            const input = document.getElementById('messengerInput');
            if (input) setTimeout(() => input.focus(), 100);
            scrollChatToBottom();
          }
        } else {
          panel.classList.remove('open');
        }
      }
    }

    function switchMessengerTab(tab) {
      messengerCurrentTab = tab;
      const tabBtnChat = document.getElementById('tabBtnChat');
      const tabBtnMembers = document.getElementById('tabBtnMembers');
      const chatBody = document.getElementById('messengerChatBody');
      const membersBody = document.getElementById('messengerMembersBody');
      const footer = document.getElementById('messengerFooter');

      if (tab === 'chat') {
        if (tabBtnChat) tabBtnChat.classList.add('active');
        if (tabBtnMembers) tabBtnMembers.classList.remove('active');
        if (chatBody) chatBody.style.display = 'flex';
        if (membersBody) membersBody.style.display = 'none';
        if (footer) footer.style.display = 'flex';
        markChatAsRead();
        scrollChatToBottom();
      } else {
        if (tabBtnChat) tabBtnChat.classList.remove('active');
        if (tabBtnMembers) tabBtnMembers.classList.add('active');
        if (chatBody) chatBody.style.display = 'none';
        if (membersBody) membersBody.style.display = 'flex';
        if (footer) footer.style.display = 'none';
        renderMessengerMembers();
      }
    }

    function renderMessengerMembers() {
      const container = document.getElementById('messengerMembersList');
      const onlineCountEl = document.getElementById('chatOnlineMemberCount');
      if (!container) return;

      const customList = getCustomWhitelist();
      const allEmails = [...new Set([...SUPER_ADMIN_EMAILS, ...customList])];

      let onlineCount = 0;
      let html = '';

      allEmails.forEach(email => {
        const safeKey = email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const pres = state.presenceData ? state.presenceData[safeKey] : null;
        const isOnline = pres && pres.status === 'online';
        if (isOnline) onlineCount++;

        const isSuper = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
        const displayName = (pres && pres.name) ? pres.name : (isSuper ? 'Super Admin' : email.split('@')[0]);

        html += `
          <div style="display: flex; justify-content: space-between; align-items: center; background: #F9FAFB; padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="position: relative;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #E5E7EB; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 11px; color: var(--text-primary);">
                  ${displayName.charAt(0).toUpperCase()}
                </div>
                <div style="position: absolute; bottom: 0; right: 0; width: 7px; height: 7px; border-radius: 50%; background: ${isOnline ? '#10B981' : '#9CA3AF'}; border: 1px solid #FFFFFF;"></div>
              </div>
              <div>
                <div style="font-weight: 600; font-size: 12px; color: var(--text-primary); max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${escapeHtml(displayName)}
                </div>
                <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">
                  ${isOnline ? '<span style="color: #16A34A; font-weight: 600;">Online Now</span>' : (pres && pres.lastActive ? `Last active: ${formatTimeAgo(pres.lastActive)}` : 'Offline')}
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="mentionMemberInChat('${escapeHtml(displayName)}')" style="font-size: 10px; padding: 2px 6px;">
              @Chat
            </button>
          </div>`;
      });

      container.innerHTML = html;
      if (onlineCountEl) onlineCountEl.textContent = onlineCount;
    }

    function mentionMemberInChat(name) {
      switchMessengerTab('chat');
      const input = document.getElementById('messengerInput');
      if (input) {
        input.value = `@${name} ` + input.value;
        input.focus();
      }
    }

    /* Audio Context Autoplay Unlocker */
    let sharedAudioCtx = null;
    function unlockAudio() {
      try {
        if (!sharedAudioCtx) {
          const AudioClass = window.AudioContext || window.webkitAudioContext;
          if (AudioClass) sharedAudioCtx = new AudioClass();
        }
        if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
          sharedAudioCtx.resume();
        }
      } catch (e) {}
    }
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });

    window.addEventListener('touchstart', unlockAudio, { passive: true });

    /* ---------------------------------------------------- */
    /* MULTI-LAYER NOTIFICATIONS: WINDOWS DESKTOP & CHIME   */
    /* ---------------------------------------------------- */
    function requestWindowsDesktopNotification() {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              showToast('ðŸ”” Notifikasi Desktop Windows Aktif!');
              try {
                new Notification('PGE Talent Pool', {
                  body: 'Notifikasi Desktop Windows aktif. Anda tidak akan melewatkan pesan chat dari tim HR!',
                  icon: '/favicon.svg'
                });
              } catch (e) {}
            }
          });
        } else if (Notification.permission === 'granted') {
          showToast('ðŸ”” Notifikasi Desktop Windows sudah aktif.');
        } else if (Notification.permission === 'denied') {
          showToast('âš ï¸ Izin notifikasi diblokir di browser. Mohon izinkan via ikon gembok di address bar.');
        }
      }
    }

    function triggerWindowsDesktopNotification(senderName, messageText) {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const notif = new Notification(`ðŸ’¬ ${senderName || 'Tim HR PGE'}`, {
            body: messageText || 'Ada pesan baru di HR Team Lounge.',
            icon: '/favicon.svg',
            tag: 'pge-team-chat',
            renotify: true
          });
          notif.onclick = () => {
            window.focus();
            if (!messengerOpen) toggleTeamMessenger();
          };
        }
      } catch (e) {
        console.warn('Desktop notification trigger error:', e);
      }
    }

    let titleFlashInterval = null;
    function startTitleFlash(unread) {
      if (titleFlashInterval) clearInterval(titleFlashInterval);
      let flag = false;
      titleFlashInterval = setInterval(() => {
        if (messengerOpen && messengerCurrentTab === 'chat') {
          stopTitleFlash();
          return;
        }
        document.title = flag ? `ðŸ”´ (${unread}) PESAN BARU! | PGE Talent Pool` : `ðŸ’¬ (${unread}) Chat Masuk | PGE Talent Pool`;
        flag = !flag;
      }, 900);
    }

    function stopTitleFlash() {
      if (titleFlashInterval) {
        clearInterval(titleFlashInterval);
        titleFlashInterval = null;
      }
      document.title = 'PGE Talent Pool | Candidate Repository';
    }

    /* Crisp Slack / Apple Modern Two-Tone Chime Synth (880Hz -> 1320Hz + Harmonic Shimmer) */
    function playChimeSound() {
      try {
        unlockAudio();
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        const ctx = sharedAudioCtx || (AudioClass ? new AudioClass() : null);
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();

        const t = ctx.currentTime;

        // Tone 1: 880 Hz (Crisp "Ding")
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, t);
        gain1.gain.setValueAtTime(0.38, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(t);
        osc1.stop(t + 0.32);

        // Tone 2: 1320 Hz (Harmonic "Dong")
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, t + 0.11);
        gain2.gain.setValueAtTime(0.0, t);
        gain2.gain.setValueAtTime(0.42, t + 0.11);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t + 0.11);
        osc2.stop(t + 0.58);

        // Tone 3: 2640 Hz (Resonant Metallic Bell Shimmer)
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(2640, t + 0.11);
        gain3.gain.setValueAtTime(0.0, t);
        gain3.gain.setValueAtTime(0.12, t + 0.11);
        gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(t + 0.11);
        osc3.stop(t + 0.45);
      } catch (e) {
        console.warn('Audio chime error:', e);
      }
    }

    let initialChatLoaded = false;
    let lastChatCount = 0;
    let lastSeenChatTimestamp = parseInt(localStorage.getItem('pge_chat_last_seen') || '0', 10);

    function markChatAsRead() {
      lastSeenChatTimestamp = Date.now();
      try {
        localStorage.setItem('pge_chat_last_seen', String(lastSeenChatTimestamp));
      } catch (e) {}
      unreadCount = 0;
      const badge = document.getElementById('messengerUnreadBadge');
      if (badge) badge.style.display = 'none';
      stopTitleFlash();
    }

    function scrollChatToBottom() {
      const body = document.getElementById('messengerChatBody');
      const anchor = document.getElementById('chatScrollAnchor');
      if (!body) return;

      const doScroll = () => {
        if (anchor) {
          anchor.scrollIntoView({ block: 'end', inline: 'nearest' });
        }
        body.scrollTop = body.scrollHeight + 10000;
      };

      doScroll();
      requestAnimationFrame(doScroll);
      setTimeout(doScroll, 40);
      setTimeout(doScroll, 150);
    }

    const clientSessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

    function listenTeamChat() {
      try {
        rtdb.ref('/team_chat/messages').limitToLast(50).on('value', (snapshot) => {
          const data = snapshot.val();
          const list = data ? Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)) : [];
          const curEmail = state.currentUser ? (state.currentUser.email || '').toLowerCase() : '';

          if (initialChatLoaded && list.length > lastChatCount) {
            const latestMsg = list[list.length - 1];
            const isFromOther = (latestMsg.senderEmail || '').toLowerCase().trim() !== curEmail;

            if (isFromOther) {
              playChimeSound();
              triggerWindowsDesktopNotification(latestMsg.senderName, latestMsg.text);

              if (!messengerOpen || messengerCurrentTab !== 'chat') {
                unreadCount++;
                const badge = document.getElementById('messengerUnreadBadge');
                if (badge) {
                  badge.textContent = unreadCount;
                  badge.style.display = 'inline-block';
                }
                showToast(`ðŸ’¬ ${latestMsg.senderName || 'Team Member'}: "${latestMsg.text}"`);
                startTitleFlash(unreadCount);
              }
            }
          } else if (!initialChatLoaded) {
            // Check unread count on initial load
            const unreadOnLoad = list.filter(m => (m.timestamp || 0) > lastSeenChatTimestamp && (m.senderEmail || '').toLowerCase().trim() !== curEmail).length;
            if (unreadOnLoad > 0 && (!messengerOpen || messengerCurrentTab !== 'chat')) {
              unreadCount = unreadOnLoad;
              const badge = document.getElementById('messengerUnreadBadge');
              if (badge) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline-block';
              }
              startTitleFlash(unreadCount);
            }
          }

          initialChatLoaded = true;
          lastChatCount = list.length;
          renderChatMessages(data);
        });
      } catch (e) {
        console.warn('Chat listener error:', e);
      }
    }

    function formatChatDateSeparator(timestamp) {
      if (!timestamp) return '';
      const msgDate = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const isSameDay = (d1, d2) => 
        d1.getDate() === d2.getDate() && 
        d1.getMonth() === d2.getMonth() && 
        d1.getFullYear() === d2.getFullYear();

      if (isSameDay(msgDate, today)) {
        return 'HARI INI';
      } else if (isSameDay(msgDate, yesterday)) {
        return 'KEMARIN';
      } else {
        return msgDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).toUpperCase();
      }
    }

    function renderChatMessages(data) {
      const body = document.getElementById('messengerChatBody');
      if (!body) return;
      if (!data) {
        body.innerHTML = '<div style="text-align: center; font-size: 11px; color: var(--text-muted); padding: 12px 0;">ðŸ‘‹ Belum ada pesan. Mulai percakapan pertama Anda dengan tim HR!</div>';
        return;
      }

      const curEmail = state.currentUser ? (state.currentUser.email || '').toLowerCase().trim() : '';
      const list = Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      let lastDateKey = null;
      let bubblesHtml = '';

      list.forEach(msg => {
        const isMe = (msg.senderEmail || '').toLowerCase().trim() === curEmail;
        const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
        const roleBadge = msg.isSuperAdmin ? 'ðŸ‘‘ Admin' : 'HR';

        const msgDateKey = msg.timestamp ? new Date(msg.timestamp).toDateString() : 'unknown';
        if (msg.timestamp && msgDateKey !== lastDateKey) {
          lastDateKey = msgDateKey;
          bubblesHtml += `
            <div class="chat-date-separator">
              <span>${formatChatDateSeparator(msg.timestamp)}</span>
            </div>`;
        }

        bubblesHtml += `
          <div class="chat-msg ${isMe ? 'me' : 'them'}">
            ${!isMe ? `
              <div style="font-size: 10px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
                <span>${escapeHtml(msg.senderName || msg.senderEmail)}</span>
                <span style="font-size: 9px; padding: 1px 4px; border-radius: 4px; background: #E5E7EB; color: #374151;">${roleBadge}</span>
              </div>
            ` : ''}
            <div class="chat-bubble">
              ${escapeHtml(msg.text || '')}
            </div>
            <div class="chat-meta">
              ${timeStr}
            </div>
          </div>`;
      });

      body.innerHTML = bubblesHtml + '<div id="chatScrollAnchor" style="height: 1px; width: 100%;"></div>';
      scrollChatToBottom();
    }

    async function handleSendTeamMessage() {
      const input = document.getElementById('messengerInput');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;
      if (!state.currentUser) return;

      const newMsg = {
        senderEmail: state.currentUser.email || 'anonymous',
        senderName: state.currentUser.displayName || state.currentUser.email || 'HR Member',
        senderPhoto: state.currentUser.photoURL || '',
        text: text,
        sessionId: clientSessionId,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        isSuperAdmin: isSuperAdmin()
      };

      try {
        input.value = '';
        await rtdb.ref('/team_chat/messages').push(newMsg);
      } catch (err) {
        console.error('Send message error:', err);
        showToast('Gagal mengirim pesan: ' + err.message);
      }
    }

    /* ---------------------------------------------------- */
    /* REALTIME CANDIDATE DISCUSSIONS & EVALUATION LISTENER */
    /* ---------------------------------------------------- */
    let initialDiscussionsLoaded = false;
    let lastTotalDiscussionCommentCount = 0;

    function listenCandidateDiscussions() {
      try {
        rtdb.ref('/candidate_discussions').on('value', (snapshot) => {
          const data = snapshot.val() || {};
          state.candidateDiscussions = data;

          let updatedCounts = {};
          let totalCount = 0;
          Object.keys(data).forEach(talentId => {
            const msgs = (data[talentId] && data[talentId].messages) ? data[talentId].messages : {};
            const c = Object.keys(msgs).length;
            updatedCounts[talentId] = c;
            totalCount += c;
          });
          state.candidateCommentCounts = updatedCounts;

          if (initialDiscussionsLoaded && totalCount > lastTotalDiscussionCommentCount) {
            playChimeSound();
          }
          initialDiscussionsLoaded = true;
          lastTotalDiscussionCommentCount = totalCount;

          // If Candidate Profile Modal is open on discussion tab, refresh messages live
          if (state.activeProfileTalentId && state.activeProfileTab === 'discussion') {
            renderCandidateDiscussionMessages(state.activeProfileTalentId);
          }

          // Re-render active view to update discussion badge numbers
          renderActiveView();
        });
      } catch (e) {
        console.warn('Candidate discussions listener error:', e);
      }
    }

    /* ==================================================== */
    /* 3D PSYDUCK ANIMATED ASSISTANT LOGIC                  */
    /* ==================================================== */
    const PSYDUCK_QUIPS = [
      "Tips HR: Periksa konsistensi video editing dan color grading kandidat sebelum memindahkan ke Shortlist! ðŸŽ¨",
      "Kandidat yang mencantumkan link Canva presentation biasanya punya visual taste yang rapi loh Kak! âœ¨",
      "Pusing mikirin kuota rekrutmen? Tenang, kamu bisa pakai fitur WhatsApp Broadcast untuk kontak banyak kandidat sekaligus! ðŸ“±",
      "Jangan lupa gunakan Quick Decision Tag di ruang diskusi untuk evaluasi kilat bersama tim! âš¡",
      "Kandidat rating 5.0 dengan domisili terdekat sangat direkomendasikan untuk panggilan interview batch pertama! â­"
    ];

    let psyduckQuipIndex = 0;

    function initPsyduckAssistant() {
      const stage = document.getElementById('psyduckStage');
      const sphere = document.getElementById('psyduckSphere');
      if (!stage || !sphere) return;

      // 3D Parallax Mouse Tracking with Gyroscopic Physics
      window.addEventListener('mousemove', (e) => {
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
        const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

        // Clamp rotation angles for smooth, realistic 3D depth
        const rotY = Math.max(-25, Math.min(25, deltaX * 25));
        const rotX = Math.max(-25, Math.min(25, -deltaY * 25));

        sphere.style.transform = `perspective(600px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) translateZ(12px)`;
        
        // Also rotate the true 3D model camera
        const model = document.getElementById('psyduckModel');
        if (model) {
          // Invert deltaX so the camera moves right when mouse is left, making the object "look" left
          const theta = -deltaX * 45; // up to 45 deg left/right
          const phi = 75 + (-deltaY * 20); // adjust up/down tilt
          model.setAttribute('camera-orbit', `${theta.toFixed(1)}deg ${phi.toFixed(1)}deg 105%`);
        }
      });

      renderPsyduckBubbleContent();
    }

    function playPsyduckQuackSound() {
      try {
        unlockAudio();
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtxClass) return;
        const ctx = sharedAudioCtx || new AudioCtxClass();
        const t = ctx.currentTime;

        // Cute playful synthesized quack chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';

        // Frequency sweep for comic quack
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(780, t + 0.08);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.22);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      } catch (e) {
        console.warn('Psyduck audio error:', e);
      }
    }

    function spawn3DMathParticles(originX, originY) {
      const symbols = ['âˆ«dx', 'âˆ‘', 'âˆšx', 'Ï€', 'âˆž', 'e^(iÏ€)+1=0', 'f(x)', '?', 'Â±', 'âˆ†'];
      const colors = ['#B45309', '#7C3AED', '#2563EB', '#059669', '#DC2626'];

      for (let i = 0; i < 9; i++) {
        const span = document.createElement('span');
        span.className = 'psyduck-math-burst';
        span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        span.style.left = (originX + (Math.random() * 20 - 10)) + 'px';
        span.style.top = (originY + (Math.random() * 20 - 10)) + 'px';
        span.style.color = colors[Math.floor(Math.random() * colors.length)];
        span.style.fontSize = (11 + Math.floor(Math.random() * 8)) + 'px';

        const tx = (Math.random() * 140 - 70) + 'px';
        const ty = (-(40 + Math.random() * 110)) + 'px';
        const rot = (Math.random() * 90 - 45) + 'deg';

        span.style.setProperty('--tx', tx);
        span.style.setProperty('--ty', ty);
        span.style.setProperty('--rot', rot);

        document.body.appendChild(span);
        setTimeout(() => span.remove(), 1050);
      }
    }

    function handlePsyduckClick(event) {
      if (event) event.stopPropagation();
      const stage = document.getElementById('psyduckStage');
      const sphere = document.getElementById('psyduckSphere');

      // 1. Play Sound
      playPsyduckQuackSound();

      // 2. Physics Head-Shake
      if (sphere) {
        sphere.classList.remove('psyduck-shake');
        void sphere.offsetWidth; // trigger reflow
        sphere.classList.add('psyduck-shake');
      }

      // 3. 3D Math Particle Explosion
      const rect = stage ? stage.getBoundingClientRect() : { left: 40, top: window.innerHeight - 80 };
      spawn3DMathParticles(rect.left + 35, rect.top + 20);

      // 4. Toggle or Refresh Bubble Content
      togglePsyduckBubble();
    }

    function togglePsyduckBubble() {
      const bubble = document.getElementById('psyduckSpeechBubble');
      if (!bubble) return;
      if (bubble.classList.contains('open')) {
        renderPsyduckBubbleContent();
      } else {
        renderPsyduckBubbleContent();
        bubble.classList.add('open');
      }
    }

    function closePsyduckBubble() {
      const bubble = document.getElementById('psyduckSpeechBubble');
      if (bubble) bubble.classList.remove('open');
    }

    function renderPsyduckBubbleContent(customMood, customMsg) {
      const bubbleText = document.getElementById('psyduckBubbleText');
      const moodBadge = document.getElementById('psyduckMoodBadge');
      const moodText = document.getElementById('psyduckMoodText');
      if (!bubbleText || !moodBadge || !moodText) return;

      if (customMsg) {
        bubbleText.textContent = customMsg;
        if (customMood) moodText.textContent = customMood;
        return;
      }

      // Compute Live Pipeline Intelligence
      const total = state.talents.length;
      const unscreened = state.talents.filter(t => (t.stage || 'prospect').toLowerCase() === 'prospect').length;
      const topRated = state.talents.filter(t => (t.overallRating || 0) >= 4.8).length;

      if (unscreened >= 10) {
        moodBadge.innerHTML = '<span>😵‍💫</span> <span>Overthinking!</span>';
        moodBadge.style.background = '#FEE2E2';
        moodBadge.style.color = '#991B1B';
        moodBadge.style.borderColor = '#FECACA';
        bubbleText.innerHTML = `Aduh pusing Kak! Masih ada <strong>${unscreened} kandidat</strong> di tahap <em>Prospect</em> yang belum discreening. Yuk review atau short-list sekarang! 😵‍💫`;
      } else if (topRated > 0 && Math.random() > 0.4) {
        moodBadge.innerHTML = '<span>⭐</span> <span>Top Talent Radar</span>';
        moodBadge.style.background = '#FEF3C7';
        moodBadge.style.color = '#92400E';
        moodBadge.style.borderColor = '#FDE68A';
        bubbleText.innerHTML = `Wah, ada <strong>${topRated} kandidat bintang lima (⭐ 5.0)</strong> di pipeline! Cek portofolio karya mereka sebelum disalip kompetitor ya Kak! 🚀`;
      } else {
        moodBadge.innerHTML = '<span>💡</span> <span>Psyduck HR Tips</span>';
        moodBadge.style.background = '#EFF6FF';
        moodBadge.style.color = '#1E40AF';
        moodBadge.style.borderColor = '#DBEAFE';
        const quip = PSYDUCK_QUIPS[psyduckQuipIndex % PSYDUCK_QUIPS.length];
        psyduckQuipIndex++;
        bubbleText.innerHTML = quip;
      }
    }

    function executePsyduckAction(actionType) {
      if (actionType === 'unscreened') {
        if (el.filterStage) {
          el.filterStage.value = 'Prospect';
          state.filters.stage = 'Prospect';
          applyFilters();
          showToast('ðŸ” Menampilkan kandidat yang belum discreening (Prospect).');
        }
      } else if (actionType === 'top-rated') {
        if (el.filterRating) {
          el.filterRating.value = '5';
          state.filters.rating = 5;
          applyFilters();
          showToast('â­ Menampilkan kandidat unggulan 5-Star.');
        }
      } else if (actionType === 'random-tip') {
        psyduckQuipIndex++;
        renderPsyduckBubbleContent();
        playPsyduckQuackSound();
      }
    }

    /* Renders permanent attached CV Card in Drawer */
    function renderAttachedCvCard(url, customName) {
      const container = document.getElementById('cvAttachedContainer');
      if (!container) return;
      if (!isValidDisplayUrl(url)) {
        container.innerHTML = '';
        return;
      }
      const displayName = customName || (url.startsWith('data:') ? 'Local CV Document' : 'Attached CV Document (Click to Preview â†—)');
      const targetHref = normalizeExternalUrl(url);
      container.innerHTML = `
        <div class="attached-cv-box" id="attachedCvCard">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <span>ðŸ“„</span>
            <a href="${targetHref}" target="_blank" rel="noopener noreferrer" style="color: #1E40AF; font-weight: 500; text-decoration: underline;">${escapeHtml(displayName)}</a>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="clearCvUrl()" style="padding: 2px 8px; font-size: 10px; color: var(--pastel-red-text);">Remove</button>
        </div>`;
    }

    function handleManualCvUrlChange(val) {
      if (isValidDisplayUrl(val)) {
        renderAttachedCvCard(val);
      } else {
        const container = document.getElementById('cvAttachedContainer');
        if (container) container.innerHTML = '';
      }
    }

    function clearCvUrl() {
      const cvInput = document.getElementById('inputCvUrl');
      if (cvInput) cvInput.value = '';
      if (state.selectedTalent) state.selectedTalent.cvUrl = '';
      const container = document.getElementById('cvAttachedContainer');
      if (container) container.innerHTML = '';
      showToast('Cleared CV link. Click Save Candidate to update.');
    }

    function addSkillRow() {
      const container = document.getElementById('skillsBuilderContainer');
      if (!container) return;
      const row = document.createElement('div');
      row.className = 'skills-builder-row';
      row.innerHTML = `
        <input type="text" class="form-input skill-name-input" placeholder="Skill name (e.g. Motion Graphics)" style="flex: 1;" onblur="this.value = toTitleCase(this.value)">
        <select class="form-select skill-rating-select" style="width: 90px;">
          <option value="5">5 â˜…</option>
          <option value="4" selected>4 â˜…</option>
          <option value="3">3 â˜…</option>
          <option value="2">2 â˜…</option>
          <option value="1">1 â˜…</option>
        </select>
        <button type="button" class="btn btn-secondary btn-icon" onclick="this.closest('.skills-builder-row').remove()" style="color: var(--pastel-red-text);">âœ•</button>`;
      container.appendChild(row);
    }

    function renderPortfolioChips() {
      const container = document.getElementById('portfolioFilesContainer');
      if (!container) return;
      if (!state.stagedPortfolioItems.length) {
        container.innerHTML = '<span style="font-size: 11px; color: var(--text-muted); font-style: italic;">No portfolio files attached yet.</span>';
        return;
      }
      container.innerHTML = state.stagedPortfolioItems.map((item, idx) => {
        const directHref = normalizeExternalUrl(item.url);
        return `
          <div class="chip">
            <span>${item.type === 'video' ? 'ðŸŽ¬' : (item.type === 'image' ? 'ðŸ–¼ï¸' : 'ðŸ“„')}</span>
            <a href="${directHref}" target="_blank" rel="noopener noreferrer" style="color: var(--text-primary); text-decoration: none; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(item.name || 'Portfolio Item')} â†—</a>
            <span class="chip-remove" onclick="removePortoItem(${idx})">âœ•</span>
          </div>`;
      }).join('');
    }

    function addManualPortoLink() {
      const input = document.getElementById('inputManualPortoUrl');
      if (!input || !input.value.trim()) return;
      const rawUrl = input.value.trim();
      const url = normalizeExternalUrl(rawUrl);
      const lower = url.toLowerCase();
      const isVid = lower.includes('.mp4') || lower.includes('youtube') || lower.includes('tiktok') || lower.includes('youtu.be');
      const isCanva = lower.includes('canva.site') || lower.includes('canva.com');
      const isDrive = lower.includes('drive.google.com');

      let defaultName = 'Portfolio Link';
      if (isVid) defaultName = 'Video Portfolio';
      else if (isCanva) defaultName = 'Canva Deck';
      else if (isDrive) defaultName = 'Google Drive';

      state.stagedPortfolioItems.push({
        name: defaultName,
        url: url,
        type: isVid ? 'video' : 'document'
      });
      input.value = '';
      renderPortfolioChips();
      showToast('Added portfolio link!');
    }

    function removePortoItem(idx) {
      state.stagedPortfolioItems.splice(idx, 1);
      renderPortfolioChips();
    }

    /* ---------------------------------------------------- */
    /* CLIENT-SIDE AUTO-COMPRESSOR (IMAGES & 50MB+ PDFS)    */
    /* ---------------------------------------------------- */
    async function compressPdfFile(file) {
      if (!window.pdfjsLib || !window.PDFLib) {
        console.warn('PDF compression libraries not ready');
        return file;
      }

      showToast(`âš¡ Compressing ${formatFileSize(file.size)} PDF into high-res lightweight format...`);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDocOriginal = await loadingTask.promise;
        const numPages = pdfDocOriginal.numPages;

        const newPdfDoc = await PDFLib.PDFDocument.create();

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDocOriginal.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          await page.render({ canvasContext: ctx, viewport: viewport }).promise;

          const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.80);
          const jpgImageBytes = await fetch(jpgDataUrl).then(res => res.arrayBuffer());
          const embeddedJpg = await newPdfDoc.embedJpg(jpgImageBytes);

          const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
          newPage.drawImage(embeddedJpg, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height
          });
        }

        const compressedPdfBytes = await newPdfDoc.save();
        const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });

        console.log(`âš¡ Compressed PDF from ${formatFileSize(file.size)} âž” ${formatFileSize(compressedBlob.size)}`);
        showToast(`âœ“ PDF compressed (${formatFileSize(file.size)} âž” ${formatFileSize(compressedBlob.size)})!`);

        return new File([compressedBlob], file.name, { type: 'application/pdf' });
      } catch (err) {
        console.error('PDF compression error:', err);
        showToast('PDF compression error, proceeding with original file...');
        return file;
      }
    }

    async function autoCompressFile(file) {
      if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp)$/i.test(file.name)) {
        try {
          const compressedBlob = await new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
              URL.revokeObjectURL(url);
              const maxDim = 1920;
              let width = img.width;
              let height = img.height;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob(
                (b) => {
                  if (b) resolve(b);
                  else resolve(file);
                },
                'image/jpeg',
                0.82
              );
            };
            img.onerror = () => resolve(file);
            img.src = url;
          });

          if (compressedBlob && compressedBlob.size < file.size) {
            console.log(`âš¡ Auto-compressed image: ${formatFileSize(file.size)} âž” ${formatFileSize(compressedBlob.size)}`);
            const dotIdx = file.name.lastIndexOf('.');
            const baseName = dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name;
            const newFileName = baseName + '.jpg';
            return new File([compressedBlob], newFileName, { type: 'image/jpeg' });
          }
        } catch (e) {
          console.warn('Image auto-compression fallback:', e);
        }
      }

      if ((file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) && file.size > 25 * 1024 * 1024) {
        return await compressPdfFile(file);
      }

      return file;
    }

    /* ---------------------------------------------------- */
    /* APPWRITE STORAGE RESUMABLE UPLOADER (UP TO 50 MB)    */
    /* ---------------------------------------------------- */
    async function enqueueAppwriteUpload(rawFile, category, targetCandidateId, targetCandidateName) {
      const file = await autoCompressFile(rawFile);

      const MAX_ALLOWED_SIZE = 49 * 1024 * 1024;
      if (file.size > MAX_ALLOWED_SIZE) {
        const sizeStr = formatFileSize(file.size);
        alert(`âš ï¸ File "${file.name}" berukuran ${sizeStr} melebihi batas 50 MB paket gratis Appwrite Cloud.\n\nðŸ’¡ Solusi Terbaik:\nSilakan masukkan link Google Drive / Canva / YouTube / TikTok pada kolom 'Attached Portfolio Items' agar portofolio video berukuran besar tetap tersimpan dalam kualitas penuh tanpa batasan kuota!`);
        
        const manualInput = document.getElementById('inputManualPortoUrl');
        if (manualInput) manualInput.focus();
        return;
      }

      const existingJob = state.globalUploads.find(j => 
        j.candidateId === targetCandidateId && 
        j.category === category && 
        j.fileName === file.name && 
        j.status === 'uploading'
      );
      if (existingJob) {
        showToast(`File ${file.name} is already uploading!`);
        return;
      }

      const uplId = 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const isVid = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4');
      const isImg = file.type.startsWith('image/');
      const fileType = isVid ? 'video' : (isImg ? 'image' : 'document');

      const job = {
        id: uplId,
        candidateId: targetCandidateId,
        candidateName: targetCandidateName,
        fileName: file.name,
        fileSize: file.size,
        category: category,
        type: fileType,
        status: 'uploading',
        progress: 5,
        downloadUrl: null
      };

      state.globalUploads.push(job);
      updateGlobalUploadPill();
      renderDrawerUploadQueues();

      const fileId = Appwrite.ID.unique();
      const uploadPromise = storage.createFile(
        APPWRITE_CONFIG.bucketId,
        fileId,
        file,
        ['read("any")'],
        function(progress) {
          const pct = Math.min(99, Math.round((progress.progress || 0) * 100));
          job.progress = pct;
          updateGlobalUploadPill();
          renderDrawerUploadQueues();
        }
      );

      uploadPromise.then(fileObj => {
        const fileViewUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${fileObj.$id}/view?project=${APPWRITE_CONFIG.projectId}`;

        job.status = 'ready';
        job.progress = 100;
        job.downloadUrl = fileViewUrl;
        updateGlobalUploadPill();
        renderDrawerUploadQueues();

        if (category === 'cv') {
          const cvInput = document.getElementById('inputCvUrl');
          if (cvInput) cvInput.value = fileViewUrl;
          if (state.selectedTalent && (state.selectedTalent.id === targetCandidateId || state.selectedTalent.$id === targetCandidateId)) {
            state.selectedTalent.cvUrl = fileViewUrl;
          }
          renderAttachedCvCard(fileViewUrl, file.name);
        } else if (category === 'porto') {
          if (!state.stagedPortfolioItems.some(it => it.url === fileViewUrl || it.name === file.name)) {
            state.stagedPortfolioItems.push({
              name: file.name,
              url: fileViewUrl,
              type: fileType
            });
          }
          renderPortfolioChips();
        }

        if (state.selectedTalent && state.selectedTalent.$id) {
          patchCandidateInAppwrite(state.selectedTalent.$id, category, fileViewUrl, file.name, fileType);
        } else {
          showToast(`â˜ï¸ Uploaded ${file.name} (Ready to Save)`);
        }
      }).catch(err => {
        console.error('Appwrite Storage upload error:', err);
        job.status = 'error';
        updateGlobalUploadPill();
        renderDrawerUploadQueues();
        showToast(`âš ï¸ Upload error: ${err.message || 'Storage error'}`);
      });
    }

    async function patchCandidateInAppwrite(docId, category, fileUrl, fileName, fileType) {
      if (!docId || !fileUrl) return;

      try {
        if (category === 'cv') {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            docId,
            { cvUrl: fileUrl }
          );
          showToast(`â˜ï¸ CV saved to Appwrite!`);
        } else if (category === 'porto') {
          const target = state.talents.find(t => t.$id === docId || t.id === docId);
          const currentItems = target && target.portfolioItems ? [...target.portfolioItems] : [...state.stagedPortfolioItems];
          if (!currentItems.some(it => it.url === fileUrl || it.name === fileName)) {
            currentItems.push({ name: fileName, url: fileUrl, type: fileType });
          }
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            docId,
            {
              portfolioUrl: fileUrl,
              portfolioItemsJson: JSON.stringify(currentItems)
            }
          );
          showToast(`â˜ï¸ Portfolio saved to Appwrite!`);
        }
      } catch (e) {
        console.warn('Auto-patch document error:', e);
      }
    }

    function updateGlobalUploadPill() {
      if (!el.globalUploadPill) return;
      const activeJobs = state.globalUploads.filter(j => j.status === 'uploading');
      
      if (activeJobs.length > 0) {
        el.globalUploadPill.classList.add('active');
        el.globalUploadPill.classList.remove('success');
        
        const avgProgress = Math.round(activeJobs.reduce((sum, j) => sum + j.progress, 0) / activeJobs.length);
        if (el.globalUploadIcon) el.globalUploadIcon.textContent = 'â˜ï¸';
        if (el.globalUploadText) el.globalUploadText.textContent = `Streaming ${activeJobs.length} file${activeJobs.length > 1 ? 's' : ''} to Appwrite (${avgProgress}%)`;
        if (el.globalUploadTrack) el.globalUploadTrack.style.display = 'block';
        if (el.globalUploadBar) el.globalUploadBar.style.width = avgProgress + '%';
      } else {
        const completedRecently = state.globalUploads.filter(j => j.status === 'ready');
        if (completedRecently.length > 0) {
          el.globalUploadPill.classList.add('active', 'success');
          if (el.globalUploadIcon) el.globalUploadIcon.textContent = 'âœ“';
          if (el.globalUploadText) el.globalUploadText.textContent = 'Saved to Appwrite Storage!';
          if (el.globalUploadTrack) el.globalUploadTrack.style.display = 'none';

          setTimeout(() => {
            if (state.globalUploads.every(j => j.status !== 'uploading')) {
              el.globalUploadPill.classList.remove('active');
            }
          }, 3500);
        } else {
          el.globalUploadPill.classList.remove('active');
        }
      }
    }

    function renderDrawerUploadQueues() {
      const curId = state.selectedTalent ? state.selectedTalent.id : null;
      if (!curId) return;

      const cvQueueEl = document.getElementById('cvUploadQueue');
      const portoQueueEl = document.getElementById('portoUploadQueue');

      if (cvQueueEl) {
        const cvJobs = state.globalUploads.filter(j => j.candidateId === curId && j.category === 'cv' && j.status === 'uploading');
        cvQueueEl.innerHTML = cvJobs.map(item => generateUploadItemHtml(item)).join('');
      }

      if (portoQueueEl) {
        const portoJobs = state.globalUploads.filter(j => j.candidateId === curId && j.category === 'porto' && j.status === 'uploading');
        portoQueueEl.innerHTML = portoJobs.map(item => generateUploadItemHtml(item)).join('');
      }
    }

    function generateUploadItemHtml(item) {
      const isComplete = item.status === 'ready';
      const isError = item.status === 'error';
      const typeIcon = item.type === 'video' ? 'ðŸŽ¬' : (item.type === 'image' ? 'ðŸ–¼ï¸' : 'ðŸ“„');

      return `
        <div class="upload-item-card" id="card_${item.id}">
          <div class="upload-item-header">
            <div class="upload-item-name">
              <span>${typeIcon}</span>
              <span>${escapeHtml(item.fileName)}</span>
            </div>
            <div class="upload-item-meta" style="color:var(--text-muted);">${formatFileSize(item.fileSize)}</div>
          </div>
          
          <div class="upload-progress-track">
            <div class="upload-progress-fill ${isComplete ? 'complete' : ''}" 
                 id="bar_${item.id}" 
                 style="width: ${item.progress}%; ${isError ? 'background: #DC2626;' : ''}"></div>
          </div>

          <div class="upload-status-row">
            <div id="status_${item.id}">
              ${isComplete ? `
                <span class="badge-status-ready">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Uploaded &amp; Linked âœ“
                </span>
              ` : (isError ? `
                <span style="color: #DC2626; font-weight: 500;">Upload Failed.</span>
              ` : `
                <span class="badge-status-uploading" style="color: #2563EB;">
                  <svg class="spin-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                  Streaming to Appwrite (${item.progress}%)...
                </span>
              `)}
            </div>
            ${isComplete && item.downloadUrl ? `
              <a href="${item.downloadUrl}" target="_blank" style="font-size: 10px; color: #2563EB; font-weight: 500; text-decoration: underline;">Preview â†—</a>
            ` : ''}
          </div>
        </div>`;
    }

    /* ---------------------------------------------------- */
    /* CV DROPZONE HANDLERS                                 */
    /* ---------------------------------------------------- */
    function handleCvDragOver(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('cvDropzone');
      if (dz) dz.classList.add('drag-active');
    }
    function handleCvDragEnter(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('cvDropzone');
      if (dz) dz.classList.add('drag-active');
    }
    function handleCvDragLeave(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('cvDropzone');
      if (dz) dz.classList.remove('drag-active');
    }
    function handleCvDrop(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('cvDropzone');
      if (dz) dz.classList.remove('drag-active');
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        triggerCvUpload(dt.files[0]);
      }
    }
    function handleCvFileSelect(e) {
      const files = e.target.files;
      if (files && files.length > 0) {
        triggerCvUpload(files[0]);
      }
      e.target.value = '';
    }

    function triggerCvUpload(file) {
      const candidateId = state.selectedTalent ? state.selectedTalent.id : ('PGE-' + String(state.talents.length + 1).padStart(3, '0'));
      const candidateName = (document.getElementById('inputName') && document.getElementById('inputName').value.trim()) || (state.selectedTalent ? state.selectedTalent.name : 'Candidate');

      enqueueAppwriteUpload(file, 'cv', candidateId, candidateName);
      showToast('â˜ï¸ Streaming CV to Appwrite...');
    }

    /* ---------------------------------------------------- */
    /* PORTFOLIO DROPZONE HANDLERS                          */
    /* ---------------------------------------------------- */
    function handlePortoDragOver(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('portoDropzone');
      if (dz) dz.classList.add('drag-active');
    }
    function handlePortoDragEnter(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('portoDropzone');
      if (dz) dz.classList.add('drag-active');
    }
    function handlePortoDragLeave(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('portoDropzone');
      if (dz) dz.classList.remove('drag-active');
    }
    function handlePortoDrop(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('portoDropzone');
      if (dz) dz.classList.remove('drag-active');
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        Array.from(dt.files).forEach(f => triggerPortoUpload(f));
      }
    }
    function handlePortoFileSelect(e) {
      const files = Array.from(e.target.files || []);
      files.forEach(f => triggerPortoUpload(f));
      e.target.value = '';
    }

    function triggerPortoUpload(file) {
      const candidateId = state.selectedTalent ? state.selectedTalent.id : ('PGE-' + String(state.talents.length + 1).padStart(3, '0'));
      const candidateName = (document.getElementById('inputName') && document.getElementById('inputName').value.trim()) || (state.selectedTalent ? state.selectedTalent.name : 'Candidate');

      enqueueAppwriteUpload(file, 'porto', candidateId, candidateName);
      showToast('â˜ï¸ Streaming Portfolio to Appwrite...');
    }

    /* Save candidate into Appwrite with Auto-Capitalization */
    async function handleSaveCandidate() {
      const rawName = document.getElementById('inputName').value.trim();
      if (!rawName) { showToast('Please enter candidate name'); return; }

      const name = toTitleCase(rawName);
      const role = toTitleCase(document.getElementById('inputRole').value.trim()) || 'Freelance Content Creator';
      const phone = formatToInternationalPhone(document.getElementById('inputPhone').value.trim());
      const email = cleanEmail(document.getElementById('inputEmail').value.trim());
      const experienceLevel = document.getElementById('inputLevel').value;
      const domisili = toTitleCase(document.getElementById('inputDomisili') ? document.getElementById('inputDomisili').value.trim() : '');
      const education = cleanEducation(document.getElementById('inputEducation') ? document.getElementById('inputEducation').value.trim() : '');
      const overallRating = Number(document.getElementById('inputOverallRating').value);
      const stage = document.getElementById('inputStage').value;
      const expectedSalary = document.getElementById('inputSalary').value.trim();
      const notes = document.getElementById('inputNotes').value.trim();
      const cvUrl = document.getElementById('inputCvUrl') ? document.getElementById('inputCvUrl').value.trim() : '';

      const skills = [];
      document.querySelectorAll('.skills-builder-row').forEach(row => {
        const sName = toTitleCase(row.querySelector('.skill-name-input').value.trim());
        const sRating = Number(row.querySelector('.skill-rating-select').value);
        if (sName) skills.push({ name: sName, rating: sRating });
      });

      let structuredNotes = notes;
      if (education && !structuredNotes.toLowerCase().includes('pendidikan:')) {
        structuredNotes = `Pendidikan: ${education}\n` + structuredNotes;
      }
      if (domisili && !structuredNotes.toLowerCase().includes('domisili:')) {
        structuredNotes = `Domisili: ${domisili}\n` + structuredNotes;
      }

      const targetId = state.selectedTalent ? (state.selectedTalent.id || state.selectedTalent.$id) : ('PGE-' + String(state.talents.length + 1).padStart(3, '0'));
      const docId = (targetId || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

      let primaryPorto = '';
      if (state.stagedPortfolioItems.length > 0) {
        const validItem = state.stagedPortfolioItems.find(p => isValidDisplayUrl(p.url));
        if (validItem) primaryPorto = validItem.url;
      }

      const docPayload = {
        talentId: targetId,
        name: name,
        role: role,
        phone: phone,
        email: email,
        experienceLevel: experienceLevel,
        overallRating: overallRating,
        stage: stage || 'Prospect',
        expectedSalary: expectedSalary || 'Standard Uang Saku',
        domisili: domisili,
        education: education,
        notes: structuredNotes.trim(),
        cvUrl: cvUrl,
        portfolioUrl: primaryPorto,
        portfolioItemsJson: JSON.stringify(state.stagedPortfolioItems),
        skillsJson: JSON.stringify(skills)
      };

      if (!state.selectedTalent && !isSuperAdmin()) {
        showToast('âš ï¸ Only Super Admin (hrdcvpge@gmail.com) is authorized to add new candidates.');
        return;
      }

      closeDrawer();
      showToast('Saving candidate to Appwrite Cloud...');

      try {
        if (state.selectedTalent && state.selectedTalent.$id) {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            state.selectedTalent.$id,
            docPayload
          );
          showToast('âœ… Candidate updated successfully!');
        } else {
          try {
            await databases.createDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collectionId,
              docId,
              docPayload,
              ['read("any")', 'update("any")', 'delete("any")']
            );
            showToast('âœ… New candidate created successfully!');
          } catch (createErr) {
            if (createErr.code === 409 || (createErr.message && createErr.message.includes('already exists'))) {
              await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collectionId,
                docId,
                docPayload
              );
              showToast('âœ… Candidate updated successfully!');
            } else {
              throw createErr;
            }
          }
        }
        loadAppwriteTalents();
      } catch (err) {
        console.error('Appwrite save error:', err);
        showToast('Save error: ' + (err.message || 'Check connection'));
      }
    }

    async function deleteCandidate(id, name) {
      if (!isSuperAdmin()) {
        showToast('âš ï¸ Only Super Admin (hrdcvpge@gmail.com) is authorized to delete candidates.');
        return;
      }

      if (!confirm('Are you sure you want to delete ' + (name || id) + ' from Appwrite?')) return;

      const target = state.talents.find(t => t.id === id || t.$id === id);
      const docId = target && target.$id ? target.$id : (id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

      try {
        await databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          docId
        );
        showToast('Deleted candidate: ' + (name || id));
        loadAppwriteTalents();
      } catch (err) {
        console.error('Delete error:', err);
        showToast('Delete error: ' + err.message);
      }
    }

    function handleDeleteCurrentCandidate() {
      if (!isSuperAdmin()) {
        showToast('âš ï¸ Only Super Admin is authorized to delete candidates.');
        return;
      }
      if (!state.selectedTalent) return;
      deleteCandidate(state.selectedTalent.id, state.selectedTalent.name);
      closeDrawer();
    }

    function handleExportCSV() {
      if (!state.talents.length) { showToast('No data to export'); return; }
      const headers = ['ID', 'Nama', 'Role', 'WhatsApp', 'Email', 'Level', 'Rating', 'Stage', 'Gaji', 'CV URL', 'Portfolio URL', 'Notes'];
      const rows = state.talents.map(t => [
        t.id,
        `"${(t.name || '').replace(/"/g, '""')}"`,
        `"${(t.role || '').replace(/"/g, '""')}"`,
        `"${(formatToInternationalPhone(t.phone) || '').replace(/"/g, '""')}"`,
        `"${(t.email || '').replace(/"/g, '""')}"`,
        t.experienceLevel || '',
        t.overallRating || '',
        t.stage || '',
        `"${(t.expectedSalary || '').replace(/"/g, '""')}"`,
        `"${(t.cvUrl || '').replace(/"/g, '""')}"`,
        `"${(t.portfolioUrl || '').replace(/"/g, '""')}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ]);
      const csv = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
      const a = document.createElement('a');
      a.href = csv;
      a.download = `PGE_Talent_Pool_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Exported CSV successfully!');
    }

    function showToast(msg) {
      if (!el.toastContainer) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = msg;
      el.toastContainer.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.2s';
        setTimeout(() => toast.remove(), 200);
      }, 3000);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Window Export Bindings
    window.isSuperAdmin = isSuperAdmin;
    window.handleGoogleSignIn = handleGoogleSignIn;
    window.handleDirectSuperAdminAccess = handleDirectSuperAdminAccess;
    window.handleSignOut = handleSignOut;
    window.updateCandidateStage = updateCandidateStage;
    window.openAddCandidateDrawer = openAddCandidateDrawer;
    window.openTalentDetail = openTalentDetail;
    window.closeDrawer = closeDrawer;
    window.handleSaveCandidate = handleSaveCandidate;
    window.deleteCandidate = deleteCandidate;
    window.handleDeleteCurrentCandidate = handleDeleteCurrentCandidate;
    window.switchView = switchView;
    window.resetFilters = resetFilters;
    window.handleExportCSV = handleExportCSV;
    window.toggleAnalyticsDashboard = toggleAnalyticsDashboard;
    window.renderAnalyticsDashboard = renderAnalyticsDashboard;
    window.addSkillRow = addSkillRow;
    window.addManualPortoLink = addManualPortoLink;
    window.removePortoItem = removePortoItem;
    window.clearCvUrl = clearCvUrl;
    window.handleManualCvUrlChange = handleManualCvUrlChange;
    window.handleCvDragOver = handleCvDragOver;
    window.handleCvDragEnter = handleCvDragEnter;
    window.handleCvDragLeave = handleCvDragLeave;
    window.handleCvDrop = handleCvDrop;
    window.handleCvFileSelect = handleCvFileSelect;
    window.handlePortoDragOver = handlePortoDragOver;
    window.handlePortoDragEnter = handlePortoDragEnter;
    window.handlePortoDragLeave = handlePortoDragLeave;
    window.handlePortoDrop = handlePortoDrop;
    window.handlePortoFileSelect = handlePortoFileSelect;
    window.formatToInternationalPhone = formatToInternationalPhone;
    window.handleNameBlur = handleNameBlur;
    window.handlePhoneBlur = handlePhoneBlur;
    window.checkDuplicateLive = checkDuplicateLive;
    window.addQuickTag = addQuickTag;
    window.toTitleCase = toTitleCase;
    window.cleanEducation = cleanEducation;
    window.cleanEmail = cleanEmail;
    window.toggleCompareCandidate = toggleCompareCandidate;
    window.updateCompareBar = updateCompareBar;
    window.clearComparison = clearComparison;
    window.openComparisonModal = openComparisonModal;
    window.closeComparisonModal = closeComparisonModal;
    window.openPortoGalleryModal = openPortoGalleryModal;
    window.closePortoGalleryModal = closePortoGalleryModal;
    window.openWhitelistModal = openWhitelistModal;
    window.closeWhitelistModal = closeWhitelistModal;
    window.handleAddWhitelistEmail = handleAddWhitelistEmail;
    window.handleRemoveWhitelistEmail = handleRemoveWhitelistEmail;
    window.toggleTeamMessenger = toggleTeamMessenger;
    window.switchMessengerTab = switchMessengerTab;
    window.mentionMemberInChat = mentionMemberInChat;
    window.handleSendTeamMessage = handleSendTeamMessage;
    window.handleBroadcastTemplateChange = handleBroadcastTemplateChange;
    window.insertVariableIntoMessage = insertVariableIntoMessage;
    window.updateBroadcastPreview = updateBroadcastPreview;
    window.toggleBroadcastSelect = toggleBroadcastSelect;
    window.toggleSelectAllBroadcast = toggleSelectAllBroadcast;
    window.handleCandidateCardClick = handleCandidateCardClick;
    window.openCandidateProfileModal = openCandidateProfileModal;
    window.closeCandidateProfileModal = closeCandidateProfileModal;
    window.openCandidateDiscussion = openCandidateDiscussion;
    window.switchProfileTab = switchProfileTab;
    window.selectDecisionTag = selectDecisionTag;
    window.handleSendCandidateComment = handleSendCandidateComment;
    window.handleDeleteCandidateComment = handleDeleteCandidateComment;
    window.switchToEditDrawer = switchToEditDrawer;
    window.requestWindowsDesktopNotification = requestWindowsDesktopNotification;
    window.sendBroadcastSingle = sendBroadcastSingle;
    window.renderBroadcastTable = renderBroadcastTable;
    window.selectVacancy = selectVacancy;
    window.renderVacancyHub = renderVacancyHub;
    window.getUniqueVacancies = getUniqueVacancies;
    window.normalizeExternalUrl = normalizeExternalUrl;
    window.handlePsyduckClick = handlePsyduckClick;
    window.closePsyduckBubble = closePsyduckBubble;
    window.executePsyduckAction = executePsyduckAction;
    window.renderPsyduckBubbleContent = renderPsyduckBubbleContent;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootApp);
    } else {
      bootApp();
    }
  