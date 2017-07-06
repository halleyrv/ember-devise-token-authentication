import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('authenticated-component', 'Integration | Component | authenticated component', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{authenticated-component}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#authenticated-component}}
      template block text
    {{/authenticated-component}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
