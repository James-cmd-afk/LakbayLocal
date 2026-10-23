const router = require('express').Router();
const ctrl   = require('../controllers/itineraryController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate); // all itinerary routes require auth

router.get('/',                           ctrl.listMine);
router.post('/',                          ctrl.create);
router.get('/:id',                        ctrl.getOne);
router.put('/:id',                        ctrl.update);
router.delete('/:id',                     ctrl.remove);
router.post('/:id/items',                 ctrl.addItem);
router.delete('/:id/items/:itemId',       ctrl.removeItem);

module.exports = router;
