import Ember from 'ember';

export default Ember.Component.extend({
	actions:{
		invalidateSession(){
			alert("Antes de cerrar tu id de authenticacion es" + this.get('session.data.authenticated.uid'));
			this.get('session').invalidate();	
		},
		verUidSession(){
			alert(this.get('session.data.authenticated.uid'));
		}
	}
});
