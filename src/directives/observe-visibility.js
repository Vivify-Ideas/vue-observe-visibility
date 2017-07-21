function throwValueError (value) {
  if (value !== null && typeof value !== 'function') {
    throw new Error('observe-visibility directive expects a function as the value')
  }
}

function attachIntersectionObserver (el, vnode, options) {
  const observer = el._vue_intersectionObserver = new IntersectionObserver(entries => {
    var entry = entries[0]
    if (el._vue_visibilityCallback) {
      el._vue_visibilityCallback.call(null, entry.intersectionRatio > 0, entry)
    }
  }, options)
  // Wait for the element to be in document
  vnode.context.$nextTick(() => {
    el._enabledIntersectionObserver = true
    observer.observe(el)
  })
}

function removeIntersectionObserver (el) {
  if (el._vue_intersectionObserver) {
    el._vue_intersectionObserver.disconnect()
    el._enabledIntersectionObserver = false
    delete el._vue_intersectionObserver
    delete el._vue_visibilityCallback
  }
}

export default {
  bind (el, binding, vnode) {
    if (!binding.value.enabled) {
      el._enabledIntersectionObserver = false
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      console.warn('[vue-observe-visibility] IntersectionObserver API is not available in your browser. Please install this polyfill: https://github.com/WICG/IntersectionObserver/tree/gh-pages/polyfill')
    } else {
      throwValueError(binding.value.callback)
      el._vue_visibilityCallback = binding.value.callback
      attachIntersectionObserver(el, vnode, binding.value.options)
    }
  },
  update (el, binding, vnode) {
    throwValueError(binding.value.callback)
    el._vue_visibilityCallback = binding.value.callback

    if (binding.value.enabled && !el._enabledIntersectionObserver) {
      attachIntersectionObserver(el, vnode, binding.value.options)
    }
    if (!binding.value.enabled) {
      removeIntersectionObserver(el)
    }
  },
  unbind (el) {
    removeIntersectionObserver(el)
  },
}
