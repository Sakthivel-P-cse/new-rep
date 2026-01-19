"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const express_session_1 = __importDefault(require("express-session"));
const connect_sqlite3_1 = __importDefault(require("connect-sqlite3"));
const db_1 = require("./db");
const auth_1 = __importDefault(require("./routes/auth"));
const certificates_1 = __importDefault(require("./routes/certificates"));
const share_1 = __importDefault(require("./routes/share"));
const layout_1 = require("./middleware/layout");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 3000);
const SQLiteStore = (0, connect_sqlite3_1.default)(express_session_1.default);
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(process.cwd(), 'views'));
app.use(express_ejs_layouts_1.default);
app.set('layout', 'layout');
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use('/public', express_1.default.static(path_1.default.join(process.cwd(), 'public')));
app.use(layout_1.injectUserToViews);
app.use((0, express_session_1.default)({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: process.cwd() }),
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
}));
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});
app.use('/', auth_1.default);
app.get('/dashboard', (req, res) => {
    const user = req.session.user;
    if (!user)
        return res.redirect('/login');
    const certs = db_1.db
        .prepare('SELECT * FROM certificates WHERE owner_user_id = ? ORDER BY created_at DESC')
        .all(user.id);
    res.render('dashboard', { user, certs });
});
app.use('/certificates', certificates_1.default);
app.use('/share', share_1.default);
app.listen(PORT, () => {
    console.log(`DigiLocker server running at http://localhost:${PORT}`);
});
