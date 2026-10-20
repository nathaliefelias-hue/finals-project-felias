// --- THREE.JS 3D BACKGROUND ANIMATION ---
let scene, camera, renderer, butterflies = [];

function init3D() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa855f7, 2, 50);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    for (let i = 0; i < 18; i++) {
        createButterfly();
    }

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    animate();
}

function createButterfly() {
    const butterflyGroup = new THREE.Group();

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.bezierCurveTo(2, 4, 5, 3, 4, 0);
    wingShape.bezierCurveTo(5, -2, 2, -4, 0, 0);

    const geometry = new THREE.ShapeGeometry(wingShape);
    const colors = [0xec4899, 0x06b6d4, 0xa855f7];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    const material = new THREE.MeshPhongMaterial({
        color: chosenColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
    });

    const leftWing = new THREE.Mesh(geometry, material);
    const rightWing = new THREE.Mesh(geometry, material);
    rightWing.scale.set(-1, 1, 1);

    butterflyGroup.add(leftWing);
    butterflyGroup.add(rightWing);

    butterflyGroup.position.x = (Math.random() - 0.5) * 50;
    butterflyGroup.position.y = (Math.random() - 0.5) * 40;
    butterflyGroup.position.z = (Math.random() - 0.5) * 30;

    const scale = 0.4 + Math.random() * 0.5;
    butterflyGroup.scale.set(scale, scale, scale);

    butterflyGroup.userData = {
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: (Math.random() - 0.5) * 0.05,
        speedZ: (Math.random() - 0.5) * 0.03,
        flapSpeed: 0.08 + Math.random() * 0.08,
        flapAngle: 0,
        leftWing: leftWing,
        rightWing: rightWing
    };

    scene.add(butterflyGroup);
    butterflies.push(butterflyGroup);
}

let mouseX = 0, mouseY = 0;
function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 10 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    butterflies.forEach(b => {
        b.position.x += b.userData.speedX;
        b.position.y += b.userData.speedY;
        b.position.z += b.userData.speedZ;

        if (Math.abs(b.position.x) > 30) b.userData.speedX *= -1;
        if (Math.abs(b.position.y) > 25) b.userData.speedY *= -1;
        if (Math.abs(b.position.z) > 20) b.userData.speedZ *= -1;

        b.userData.flapAngle += b.userData.flapSpeed;
        const flap = Math.sin(b.userData.flapAngle) * 0.8;
        b.userData.leftWing.rotation.y = flap;
        b.userData.rightWing.rotation.y = -flap;
        b.rotation.z = Math.sin(b.userData.flapAngle * 0.5) * 0.2;
    });

    renderer.render(scene, camera);
}

function reset3DView() {
    mouseX = 0;
    mouseY = 0;
    camera.position.set(0, 0, 30);
}

// --- NAVIGATION LOGIC ---

function navigateToDashboard(event) {
    if (event) event.preventDefault();

    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');

    if (loginPage && dashboardPage) {
        loginPage.classList.remove('active');
        dashboardPage.classList.add('active');
        switchTab('about');
    }
}

function logout() {
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');

    if (loginPage && dashboardPage) {
        dashboardPage.classList.remove('active');
        loginPage.classList.add('active');
    }
}

function switchTab(tabId) {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const activeBtn = Array.from(buttons).find(btn => {
        const onClickAttr = btn.getAttribute('onclick') || '';
        return onClickAttr.includes(tabId);
    });
    if (activeBtn) activeBtn.classList.add('active');

    const sections = document.querySelectorAll('.section-content');
    sections.forEach(sec => sec.classList.remove('active'));

    const targetSection = document.getElementById(tabId + '-section');
    if (targetSection) targetSection.classList.add('active');
}

// --- PROFILE PICTURE LOGIC WITH LOCALSTORAGE ---

function openPhotoModal() {
    const modal = document.getElementById('photo-modal');
    if (modal) modal.classList.add('active');
}

function closePhotoModal() {
    const modal = document.getElementById('photo-modal');
    if (modal) modal.classList.remove('active');
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-img').src = e.target.result;
            document.getElementById('photo-url-input').value = '';
        };
        reader.readAsDataURL(file);
    }
}

function handleUrlInput(event) {
    const url = event.target.value.trim();
    if (url) {
        document.getElementById('preview-img').src = url;
        document.getElementById('photo-file-input').value = '';
    }
}

function saveProfilePhoto() {
    const previewSrc = document.getElementById('preview-img').src;
    localStorage.setItem('nathalie_profile_pic', previewSrc);
    applySavedPhoto();
    closePhotoModal();
}

function applySavedPhoto() {
    const savedPic = localStorage.getItem('nathalie_profile_pic');
    if (savedPic) {
        const mainImg = document.getElementById('main-profile-img');
        const navImg = document.getElementById('nav-avatar-img');
        const previewImg = document.getElementById('preview-img');

        if (mainImg) mainImg.src = savedPic;
        if (navImg) navImg.src = savedPic;
        if (previewImg) previewImg.src = savedPic;
    }
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    init3D();
    applySavedPhoto();
});