const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// === CONFIG - CHANGE HERE ===
const ALHAJI = {
  name: 'Alhaji Sir Shina Akanni International',
  shortName: 'Sir Shina Akanni(S.S.A)',
  tagline: 'Maryland, USA & Ibafo, Ogun State Fuji Legend',
  phone: '2348023014535', // HIS REAL WHATSAPP - no +
  whatsappMsg: 'Alhaji, I saw your website, I want to book you',
  youtubeId: '76RNVoM3ADQ',
  adminPass: 'fuji2026' // Password for /admin - change it
};

let packages = [
  { _id: '1', name: 'USA Tour Package', price: '$3,000', priceNote: 'For US Clients', duration: '4 Hours Performance', description: 'Full 10-man Fuji band, talking drums, premium sound. For Maryland, Houston, Chicago weddings, birthdays. Flight & hotel not included.', isActive: true, image: '' },
  { _id: '2', name: 'Lagos / Ogun Premium', price: '₦800,000', priceNote: 'Most Popular', duration: '5 Hours', description: 'Full band for Lagos, Ibafo, Mowe, Abeokuta, Ibadan. 8-man crew with lights.', isActive: true, image: '' },
  { _id: '3', name: 'Naming / Small Party', price: '₦350,000', priceNote: 'Ibafo & Mowe', duration: '3 Hours', description: 'Small band for intimate events.', isActive: true, image: '' }
];
let bookings = [];
let nextId = 1;

// Simple admin protection
function adminAuth(req,res,next){
  if(req.query.pass === ALHAJI.adminPass) return next();
  res.send(`<body style="background:#000;color:#fff;font-family:system-ui;padding:40px"><h2>Admin Login</h2><p>Add ?pass=${ALHAJI.adminPass} to URL</p><p>Example: /admin/bookings?pass=${ALHAJI.adminPass}</p><a href="/" style="color:#f5c518">Home</a></body>`);
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

// Admin
app.get('/admin/bookings', adminAuth, (req,res)=> res.render('admin/bookings', { bookings, alhaji: ALHAJI, pass: req.query.pass }));
app.get('/admin/packages', adminAuth, (req,res)=> res.render('admin/packages', { packages, alhaji: ALHAJI, pass: req.query.pass }));
app.post('/admin/packages', adminAuth, (req,res)=>{
  const action = req.body.action;
  if(action==='add'){
    packages.push({ _id: String(Date.now()), name: req.body.name, price: req.body.price, priceNote: req.body.priceNote || 'Custom', duration: req.body.duration, description: req.body.description, isActive:true, image: req.body.image || '' });
  } else if(action==='delete'){
    packages = packages.filter(p=>p._id!==req.body.id);
  }
  res.redirect('/admin/packages?pass='+req.query.pass);
});
app.get('/admin/bookings/delete/:id', adminAuth, (req,res)=>{ bookings = bookings.filter(b=>b._id!==req.params.id); res.redirect('/admin/bookings?pass='+req.query.pass); });
app.get('/admin', adminAuth, (req,res)=> res.redirect('/admin/bookings?pass='+req.query.pass));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🔥 FUJIBOOK FULL LIVE http://localhost:${PORT} Admin pass: ${ALHAJI.adminPass}`));