HTMLWidgets.widget({

  name: "rhtmlDendrogram",
  type: "output",

  initialize: function(el, width, height) {

    return DendroNetwork().width(width).height(height);

  },

  resize: function(el, width, height, instance) {
    if (width < 100 || height < 100) {
      return;
    }
    instance.width(width).height(height);
    if (instance.data) {
      this.doRenderValue(el, instance);
    }
  },

  renderValue: function(el, x, instance) {
    instance.settings(x.options).data(x.root);
    this.doRenderValue(el, instance);
  },

  doRenderValue: function(el, instance) {
    el.innerHTML = "";
    d3.select(el).call(instance);
  },
});
