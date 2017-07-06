// `/authenticators/authenticator_devise.js`
import DeviseAuthenticator from 'ember-simple-auth/authenticators/devise';
import Ember from 'ember';
import config from '../config/environment';
const { RSVP, isEmpty, run } = Ember;

export default DeviseAuthenticator.extend({
  session: Ember.inject.service('session'),
  serverTokenEndpoint: `${config.apiHost}/${config.apiNamespace}/auth/sign_in`,
  

  restore(data){
    return new RSVP.Promise((resolve, reject) => {
      if (!isEmpty(data.accessToken) && !isEmpty(data.expiry) &&
          !isEmpty(data.tokenType) && !isEmpty(data.uid) && !isEmpty(data.client)) {
        console(data);
        resolve(data);
      } else {
        reject();
      }
    });
  },

  authenticate(identification, password) {
  //console(`${config.apiHost}/${config.apiNamespace}/auth/sign_in`);
   return new RSVP.Promise((resolve, reject) => {
      const { identificationAttributeName } = this.getProperties('identificationAttributeName');
      const data = { password };
      data[identificationAttributeName] = identification;
      this.makeRequest(data).then(function(response) {
        if(response.status != 401) {
          var result = {
            accessToken: response.headers.map['access-token'],
            expiry: response.headers.map['expiry'],
            tokenType: response.headers.map['token-type'],
            uid: response.headers.map['uid'],
            client: response.headers.map['client']
          };
          run(null, resolve, result);
        }else {
          alert("Usuario o password incorrecto");
        }

      }, function(xhr) {
        run(null, reject, xhr.responseJSON || xhr.responseText);
      });
    });
  },

  invalidate() {
    return new RSVP.Promise((resolve, reject)=> {
      // load data from session to send in header request
      const uid=this.get('session.data.authenticated.uid');
      const token=this.get('session.data.authenticated.accessToken');
      const client=this.get('session.data.authenticated.client');
      
      Ember.$.ajax({
        type: "DELETE",
        url: `${config.apiHost}/${config.apiNamespace}/auth/sign_out`,
        headers: {
          'uid': uid,
          'access-token': token,
          'client': client,
        }
      }).then(function(response) {
        Ember.run(function() {
          resolve(response);
        });
      }, function(xhr, status, error) {
        Ember.run(function() {
          reject(xhr.responseJSON || xhr.responseText);
        });
      });
    });

  }

});
