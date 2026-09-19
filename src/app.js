const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session for admin login
app.use(session({
  secret: 'fujibook-secret-2026-alhaji',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// === CONFIG ===
const ALHAJI = {
  name: 'Alhaji Sir Shina Akanni International',
  shortName: 'Sir Shina Akanni(S.S.A)',
  tagline: 'Maryland, USA & Ibafo, Ogun State Fuji Legend',
  phone: '2348023014535',
  whatsappMsg: 'Alhaji, I saw your website, I want to book you',
  youtubeId: '76RNVoM3ADQ',
  adminUser: 'alhaji',
  adminPass: 'fuji2026'
};

let packages = [
  { _id: '1', name: 'USA Tour Package', price: '$3,000', priceNote: 'For US Clients', duration: '4 Hours Performance', description: 'Full 10-man Fuji band, talking drums, premium sound. For Maryland, Houston, Chicago weddings, birthdays. Flight & hotel not included.', isActive: true, image: '' },
  { _id: '2', name: 'Lagos / Ogun Premium', price: '₦800,000', priceNote: 'Most Popular', duration: '5 Hours', description: 'Full band for Lagos, Ibafo, Mowe, Abeokuta, Ibadan. 8-man crew with lights.', isActive: true, image: '' },
  { _id: '3', name: 'Naming / Small Party', price: '₦350,000', priceNote: 'Ibafo & Mowe', duration: '3 Hours', description: 'Small band for intimate events.', isActive: true, image: '' }
];
let bookings = [];
let nextId = 1;

// NEW Admin protection - session based
function adminAuth(req,res,next){
  if(req.session && req.session.isAdmin) return next();
  // allow old ?pass link for you temporarily
  if(req.query.pass === ALHAJI.adminPass){
    req.session.isAdmin = true;
    return next();
  }
  return res.redirect('/admin/login');
}

// Public
app.get('/', (req,res)=> res.render('public/index', { packages, alhaji: ALHAJI, stats: { totalBookings: bookings.length } }));
app.get('/book/:id', (req,res)=>{
  const pkg = packages.find(p=>p._id===req.params.id);
  if(!pkg) return res.redirect('/');
  res.render('public/book', { package: pkg, alhaji: ALHAJI });
});
app.post('/book/:id', (req,res)=>{
  const pkg = packages.find(p=>p._id===req.params.id);
  const b = { _id: String(nextId++), packageName: pkg.name, packagePrice: pkg.price, customerName: req.body.customerName, phone: req.body.phone, date: req.body.date, location: req.body.location, guests: req.body.guests || 'Not stated', message: req.body.message || '', status: 'Pending', createdAt: new Date().toLocaleString() };
  bookings.unshift(b);
  console.log(`NEW BOOKING: ${b.customerName} - ${b.phone} - ${b.packageName}`);
  res.render('public/success', { booking: b, alhaji: ALHAJI });
});

// === NEW LOGIN PAGES ===
app.get('/admin/login', (req,res)=>{
  res.render('admin/login', { alhaji: ALHAJI, error: null });
});
app.post('/admin/login', (req,res)=>{
  const { username, password } = req.body;
  if(username === ALHAJI.adminUser && password === ALHAJI.adminPass){
    req.session.isAdmin = true;
    return res.redirect('/admin/bookings');
  }
  res.render('admin/login', { alhaji: ALHAJI, error: 'Wrong username or password' });
});
app.get('/admin/logout', (req,res)=>{
  req.session.destroy(()=> res.redirect('/admin/login'));
});

// Admin (protected)
app.get('/admin/bookings', adminAuth, (req,res)=> res.render('admin/bookings', { bookings, alhaji: ALHAJI, pass: '' }));
app.get('/admin/packages', adminAuth, (req,res)=> res.render('admin/packages', { packages, alhaji: ALHAJI, pass: '' }));
app.post('/admin/packages', adminAuth, (req,res)=>{
  const action = req.body.action;
  if(action==='add'){
    packages.push({ _id: String(Date.now()), name: req.body.name, price: req.body.price, priceNote: req.body.priceNote || 'Custom', duration: req.body.duration, description: req.body.description, isActive:true, image: req.body.image || '' });
  } else if(action==='delete'){
    packages = packages.filter(p=>p._id!==req.body.id);
  }
  res.redirect('/admin/packages');
});
app.get('/admin/bookings/delete/:id', adminAuth, (req,res)=>{ bookings = bookings.filter(b=>b._id!==req.params.id); res.redirect('/admin/bookings'); });
app.get('/admin', (req,res)=> res.redirect('/admin/bookings'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🔥 FUJIBOOK FULL LIVE http://localhost:${PORT} Admin: alhaji / ${ALHAJI.adminPass}`));