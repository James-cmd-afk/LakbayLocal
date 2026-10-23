const router = require('express').Router();
const fav    = require('../controllers/favoritesController');
const rev    = require('../controllers/reviewsController');
const adm    = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Favorites
router.get('/favorites',                           authenticate, fav.listMine);
router.post('/favorites',                          authenticate, fav.add);
router.delete('/favorites/:destinationId',         authenticate, fav.remove);

// Reviews
router.post('/reviews',                            authenticate, rev.create);
router.delete('/reviews/:id',                      authenticate, authorize('admin'), rev.hide);

// Admin
router.get('/admin/stats',                         authenticate, authorize('admin'), adm.stats);
router.get('/admin/users',                         authenticate, authorize('admin'), adm.listUsers);
router.patch('/admin/users/:id',                   authenticate, authorize('admin'), adm.updateUser);
router.get('/admin/submissions',                   authenticate, authorize('admin'), adm.pendingSubmissions);

module.exports = router;
