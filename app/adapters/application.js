// `adapters/application.js`

import Ember from 'ember';
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

const { service } = Ember.inject;
import config from '../config/environment';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:authorizer-devise',
  host: `${config.apiHost}`,
  namespace: `${config.apiNamespace}`,
  session: service('session'),
 
  handleResponse: function(status, headers, payload, requestData) {
    console.log("ENTRO HANDLE");
    if(headers['client']) {
      let newSession = this.get('session.data');
      newSession['authenticated']['accessToken'][0] = headers['access-token'];
      newSession['authenticated']['expiry'][0] = headers['expiry'];
      newSession['authenticated']['tokenType'][0] = headers['token-type'];
      newSession['authenticated']['uid'][0] = headers['uid'];
      newSession['authenticated']['client'][0] = headers['client'];
      this.get('session.store').persist(newSession);
    } else if (status == 401) {
      this.get('session').invalidate();
    }
    //return this._super(...arguments);
    return this._super(status, headers, payload, requestData);
  }
});
