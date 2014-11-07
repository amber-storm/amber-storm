console.log('running railroad controller specs');

describe('Railroad', function() {
  beforeEach(module('baseApp')); // the specific module

  var ctrl, scope;

  beforeEach(inject(function($controller, $rootScope) {

    scope = $rootScope.$new();

    ctrl = $controller('Railroad', {
      $scope: scope
    })

  }))

  describe('universe is ok', function(){
    it('should not have broken reality', function(){
      expect(true).toBe(true);
    })
  })

  describe('scope has the right stuff on it', function(){
    it('should have a re attr', function(){
      expect(scope.railroad.road).toBeDefined();
    })
  })

})
