# [Ember Simple Auth con devise-token](http://georgeosddev.github.com/markdown-edit)

### Empecemos

En este tutorial mostrare como crear una aplicación que integre ember simple-auth con devise-token-auth rails (la parte del front end)

### Importante
Recuerda que El **Backend en Ruby on rails** con devise-auth-token lo puedes encontrar [Aqui](https://github.com/halleyrv/rails-devise-token-auth) 


## Primeros pasos

### Primero
Crear una aplicación en ember con la siguiente sintaxis:

```bash
ember new devise-auth
```

Luego, nos ubicamos en el directorio donde se creo nuestra aplicación e instalamos el addons


```bash
ember install ember-simple-auth
```

Despues vamos al archivo de configuración en :
config/environments.js y añadimos un apiNamespace y apiHost dentro de la variable ENV, nuestro archivo deberia quedar asi:

```bash
// config/environments.js
module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'devise-auth',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    apiNamespace: 'api/v1',
    apiHost: 'http://localhost:3000',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
```

Por ahora presta atención a estas dos propiedades que agregamos ya que lo utilizaremos mas adelante.

Ahora agregamos componentes y su rutas con la consola de ember ejecuta:
```bash
   ember g component login-form
```
```bash
   ember g route login

```

Esto creara archivos dentro de components y route directorio

Ahora vamos al archivo templates/components/login-form y pegamos el siguiente codigo

```bash
   <!-- app/templates/login.hbs -->
<form {{action 'authenticate' on="submit"}} >
Email: {{input value=email type="text"}}
Password: {{input value=password type="password"}}
<button type="submit">Submit</button>
</form>
{{yield}}

```

Toca irnos al archivo app/components/login-form.js y pegar lo siguiente:

```bash
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
```

Ahora vamos al archivo app/routes/login.js y pegamos lo siguiente
```bash
import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Ember.Route.extend(UnauthenticatedRouteMixin,{
});
```
Aqui tener presente lo siguiente el mixin UnauthenticatedRouteMixin sirve para decirle a ember que pueda acceder a esa ruta sin necesidad de estar autenticado, caso contrario con authenticated-route-mixin si es necesario estar autenticado para poder visualizar el contenido eso lo pondremos en la ruta protected que veremos mas adelante.


Ahora crearemos una ruta que sea protegida que sea solo vista cuando el usuario ha iniciado session para ello crearemos una ruta y luego le añadiremos el mixin authenticate-route-mixin

```bash
  ember g route protected
```

Ahora en el archivo app/routes/protected.js nuestro archivo deberia quedar asi:

```bash
import Ember from 'ember';
/*a todas la rutas que quieras proteger solo con acceso de una session authenticate pon el siguiente mixin*/
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
	
});
```

Ahora crearemos authenticators, authorizers y un adapter para ello ejecutalo siguiente:

```bash
ember g authenticator authenticator-devise
```

```bash
ember g autorizer autorizer-devise
```


```bash
ember g adapter application
```

Luego en cada archivo segun corresponda pega los siguientes codigos.

en app/adapters/application.js 

```bash
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
```

En app/authorizers/authorizer-devise.js
```bash
// `/authorizers/authorizer_devise.js`

import Ember from 'ember';
import Base from 'ember-simple-auth/authorizers/base';

const { service } = Ember.inject;

export default Base.extend({
  session: service('session'),
  authorize(data, block) {
    console("entro a authorize");
    const accessToken = data.accessToken[0];
    const expiry = data.expiry[0];
    const tokenType = data.tokenType[0];
    const uid = data.uid[0];
    const client = data.client[0];
    if (this.get('session.isAuthenticated') && !Ember.isEmpty(accessToken)) {
      block('Authorization', `Bearer ${accessToken}`);
      block('access-token', accessToken);
      block('expiry', expiry);
      block('token-type', tokenType);
      block('uid', uid);
      block('client', client);
    }
  }
});
```


En app/authenticators/authenticator-devise.js

```bash
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
```


Ahora crearemos un instance-initializer para inyectar la session en rutas y componentes y para que se manejen los enventos de login y logout

```bash
ember g instance-initializer session-events
```

 Y pega el siguiente codigo
 
```bash
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
```


Listo con ello ahora puedes utilizar el api rest en ruby on rails desde aqui inicias el servidor tanto de la aplicacion de rails como la de ember y ya deberia funcionar tu autenticacion en ember con devise-auth-token


## Special Thanks
 * [CodeMirror](http://codemirror.net/).
 * [Github](http://developer.github.com/) for API and style.
 * [marked](https://github.com/chjj/marked).
 * [highlight.js](http://softwaremaniacs.org/soft/highlight/en/).
 * [Twitter Bootstrap](http://twitter.github.com/bootstrap/) with [Font Awesome](http://fortawesome.github.com/Font-Awesome/).
 * [HTML5 ★ BOILERPLATE](http://html5boilerplate.com/).
 * [jQuery](http://jquery.com/).
 * [HTML5 ROCKS](http://www.html5rocks.com/en/tutorials/file/xhr2/) for usage of BLOB.
 * [balupton](https://github.com/balupton).

## Licence

Source code can be found on [github](https://github.com/georgeOsdDev/markdown-edit), licenced under [MIT](http://opensource.org/licenses/mit-license.php).

Developed by [Halley Rios Valenzuela](http://orsisperu.com/ruby-on-rails-outsourcing/) copiright Orsisperu.com 2017
