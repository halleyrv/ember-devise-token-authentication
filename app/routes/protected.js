import Ember from 'ember';
/*a todas la rutas que quieras proteger solo con acceso de una session authenticate pon el siguiente mixin*/
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
	
});
