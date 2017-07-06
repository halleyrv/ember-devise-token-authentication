export function initialize(appInstance) {
  
  const applicationRoute = appInstance.lookup('route:application');
  const session          = appInstance.lookup('service:session');
  //inyectamos la session en todos los componentes y rutas
  appInstance.inject('component', 'session', 'service:session');
  appInstance.inject('route', 'session', 'service:session');

  session.on('authenticationSucceeded', function() {
    applicationRoute.transitionTo('protected');
  });
  session.on('invalidationSucceeded', function() {
    applicationRoute.transitionTo('login');
  });
}

export default {
  name: 'session-events',
  after: 'ember-simple-auth',
  initialize
};
