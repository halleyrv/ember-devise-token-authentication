import Ember from 'ember';

export default Ember.Component.extend({
	actions:{
		authenticate(){
			/*
			  Recuerda que la session esta siendo inyectada desde el app/instance-initializer/session-events.js
			  con la linea appInstance.inject('component', 'session', 'service:session'); lo mismo es 
			  para las rutas appInstance.inject('route', 'session', 'service:session');
			  con esas lineas ya no es necesario inyectar en cada ruta como antes se hacia :
			  session: Ember.inject.service()
			*/ 
			this.get('session').authenticate('authenticator:authenticator-devise', this.get('email'), this.get('password'));		
		}
		

	}
});
