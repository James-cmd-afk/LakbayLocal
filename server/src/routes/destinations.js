const router = require('express').Router();
const ctrl   = require('../controllers/destinationsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/',               ctrl.list);
router.get('/categories',     ctrl.listCategories);
router.post('/budget-builder', authenticate, ctrl.budgetBuilder);
router.get('/:slug',          ctrl.getOne);
router.post('/',              authenticate, authorize('contributor','admin'), ctrl.create);
router.patch('/:id/approve',  authenticate, authorize('admin'), ctrl.approve);

module.exports = router;
