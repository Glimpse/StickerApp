require('should');
require('supertest-as-promised');
var request = require('supertest');
var app = request.agent(process.env.TEST_APP_URL);

describe('API Gateway Tests:', function testGateway() {
   
    describe('Browse integration test', function testBrowse() {
        it('Should be able to get the list of stickers', function browse(done) {
            app.get('/browse/api/items')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function finishTest(err, res) {
                res.body.items.should.not.have.lengthOf(0);
                done();
            });
        });
    });

    describe('Cart integration test', function testCart() {
        it ('Should be able to add/remove to cart', function addRemoveCartItems() {

            const userId = '123456';
            const item = {item:{_id:'59249ba8d4a29f19002c1852', id:'11',
                    tags:['Service'], name:'MailChimp', description:'MailChimp provides email marketing services', author:'MailChimp',
                    size:{width:'2in', height:'2in'}, image:'/img/logo/mailchimp.png'}, token:userId};
        
            //Get the items that are in the cart; initial data will add a few items to the cart
            return app.get('/cart/api/items')
            .query({token: userId})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(function addItem(res) {
                res.body.items.should.have.lengthOf(0);
              
                //Add an item to the cart
                return app.put('/cart/api/items/11')
                    .set('Accept', 'application/json')
                    .send(item)
                    .expect(200)
                    .expect('Content-Type', /json/);
            })
            .then (function removeItem(res) {
                res.body.items.should.have.lengthOf(1);

            //Remove item from the cart
                return app.delete('/cart/api/items/11')
                    .query({token: userId})
                    .set('Accept', 'application/json')
                    .expect(200)
                    .expect('Content-Type', /json/);
            })
            .then (function finishTest(res) {
                res.body.items.should.have.lengthOf(0);
            });
        });
    });
});