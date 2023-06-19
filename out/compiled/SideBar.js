var app = (function () {
    'use strict';

    function _mergeNamespaces(n, m) {
        m.forEach(function (e) {
            e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
                if (k !== 'default' && !(k in n)) {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        });
        return Object.freeze(n);
    }

    function noop$3() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$3;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function split_css_unit(value) {
        const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
        return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop$3;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                /** #7364  target for <template> may be provided as #document-fragment(11) */
                else
                    this.e = element((target.nodeType === 11 ? 'TEMPLATE' : target.nodeName));
                this.t = target.tagName !== 'TEMPLATE' ? target : target.content;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop$3;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop$3;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop$3, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop$3, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop$3, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop$3,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$3;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop$3;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function bind(fn, thisArg) {
      return function wrap() {
        return fn.apply(thisArg, arguments);
      };
    }

    // utils is a library of generic helper functions non-specific to axios

    const {toString} = Object.prototype;
    const {getPrototypeOf} = Object;

    const kindOf = (cache => thing => {
        const str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    })(Object.create(null));

    const kindOfTest = (type) => {
      type = type.toLowerCase();
      return (thing) => kindOf(thing) === type
    };

    const typeOfTest = type => thing => typeof thing === type;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     *
     * @returns {boolean} True if value is an Array, otherwise false
     */
    const {isArray} = Array;

    /**
     * Determine if a value is undefined
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    const isUndefined = typeOfTest('undefined');

    /**
     * Determine if a value is a Buffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    const isArrayBuffer = kindOfTest('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      let result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a String, otherwise false
     */
    const isString = typeOfTest('string');

    /**
     * Determine if a value is a Function
     *
     * @param {*} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    const isFunction = typeOfTest('function');

    /**
     * Determine if a value is a Number
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Number, otherwise false
     */
    const isNumber = typeOfTest('number');

    /**
     * Determine if a value is an Object
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an Object, otherwise false
     */
    const isObject = (thing) => thing !== null && typeof thing === 'object';

    /**
     * Determine if a value is a Boolean
     *
     * @param {*} thing The value to test
     * @returns {boolean} True if value is a Boolean, otherwise false
     */
    const isBoolean = thing => thing === true || thing === false;

    /**
     * Determine if a value is a plain Object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a plain Object, otherwise false
     */
    const isPlainObject = (val) => {
      if (kindOf(val) !== 'object') {
        return false;
      }

      const prototype = getPrototypeOf(val);
      return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
    };

    /**
     * Determine if a value is a Date
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Date, otherwise false
     */
    const isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    const isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFileList = kindOfTest('FileList');

    /**
     * Determine if a value is a Stream
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    const isStream = (val) => isObject(val) && isFunction(val.pipe);

    /**
     * Determine if a value is a FormData
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    const isFormData = (thing) => {
      let kind;
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) || (
          isFunction(thing.append) && (
            (kind = kindOf(thing)) === 'formdata' ||
            // detect form-data instance
            (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]')
          )
        )
      )
    };

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    const isURLSearchParams = kindOfTest('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     *
     * @returns {String} The String freed of excess whitespace
     */
    const trim = (str) => str.trim ?
      str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     *
     * @param {Boolean} [allOwnKeys = false]
     * @returns {any}
     */
    function forEach(obj, fn, {allOwnKeys = false} = {}) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      let i;
      let l;

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
        const len = keys.length;
        let key;

        for (i = 0; i < len; i++) {
          key = keys[i];
          fn.call(null, obj[key], key, obj);
        }
      }
    }

    function findKey(obj, key) {
      key = key.toLowerCase();
      const keys = Object.keys(obj);
      let i = keys.length;
      let _key;
      while (i-- > 0) {
        _key = keys[i];
        if (key === _key.toLowerCase()) {
          return _key;
        }
      }
      return null;
    }

    const _global = (() => {
      /*eslint no-undef:0*/
      if (typeof globalThis !== "undefined") return globalThis;
      return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global)
    })();

    const isContextDefined = (context) => !isUndefined(context) && context !== _global;

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     *
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      const {caseless} = isContextDefined(this) && this || {};
      const result = {};
      const assignValue = (val, key) => {
        const targetKey = caseless && findKey(result, key) || key;
        if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
          result[targetKey] = merge(result[targetKey], val);
        } else if (isPlainObject(val)) {
          result[targetKey] = merge({}, val);
        } else if (isArray(val)) {
          result[targetKey] = val.slice();
        } else {
          result[targetKey] = val;
        }
      };

      for (let i = 0, l = arguments.length; i < l; i++) {
        arguments[i] && forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     *
     * @param {Boolean} [allOwnKeys]
     * @returns {Object} The resulting value of object a
     */
    const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
      forEach(b, (val, key) => {
        if (thisArg && isFunction(val)) {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      }, {allOwnKeys});
      return a;
    };

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     *
     * @returns {string} content value without BOM
     */
    const stripBOM = (content) => {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    };

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     *
     * @returns {void}
     */
    const inherits = (constructor, superConstructor, props, descriptors) => {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      Object.defineProperty(constructor, 'super', {
        value: superConstructor.prototype
      });
      props && Object.assign(constructor.prototype, props);
    };

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function|Boolean} [filter]
     * @param {Function} [propFilter]
     *
     * @returns {Object}
     */
    const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
      let props;
      let i;
      let prop;
      const merged = {};

      destObj = destObj || {};
      // eslint-disable-next-line no-eq-null,eqeqeq
      if (sourceObj == null) return destObj;

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = filter !== false && getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    };

    /**
     * Determines whether a string ends with the characters of a specified string
     *
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     *
     * @returns {boolean}
     */
    const endsWith = (str, searchString, position) => {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      const lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };


    /**
     * Returns new array from array like object or null if failed
     *
     * @param {*} [thing]
     *
     * @returns {?Array}
     */
    const toArray$1 = (thing) => {
      if (!thing) return null;
      if (isArray(thing)) return thing;
      let i = thing.length;
      if (!isNumber(i)) return null;
      const arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    };

    /**
     * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
     * thing passed in is an instance of Uint8Array
     *
     * @param {TypedArray}
     *
     * @returns {Array}
     */
    // eslint-disable-next-line func-names
    const isTypedArray = (TypedArray => {
      // eslint-disable-next-line func-names
      return thing => {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

    /**
     * For each entry in the object, call the function with the key and value.
     *
     * @param {Object<any, any>} obj - The object to iterate over.
     * @param {Function} fn - The function to call for each entry.
     *
     * @returns {void}
     */
    const forEachEntry = (obj, fn) => {
      const generator = obj && obj[Symbol.iterator];

      const iterator = generator.call(obj);

      let result;

      while ((result = iterator.next()) && !result.done) {
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
      }
    };

    /**
     * It takes a regular expression and a string, and returns an array of all the matches
     *
     * @param {string} regExp - The regular expression to match against.
     * @param {string} str - The string to search.
     *
     * @returns {Array<boolean>}
     */
    const matchAll = (regExp, str) => {
      let matches;
      const arr = [];

      while ((matches = regExp.exec(str)) !== null) {
        arr.push(matches);
      }

      return arr;
    };

    /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
    const isHTMLForm = kindOfTest('HTMLFormElement');

    const toCamelCase = str => {
      return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
        function replacer(m, p1, p2) {
          return p1.toUpperCase() + p2;
        }
      );
    };

    /* Creating a function that will check if an object has a property. */
    const hasOwnProperty = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

    /**
     * Determine if a value is a RegExp object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a RegExp object, otherwise false
     */
    const isRegExp = kindOfTest('RegExp');

    const reduceDescriptors = (obj, reducer) => {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      const reducedDescriptors = {};

      forEach(descriptors, (descriptor, name) => {
        if (reducer(descriptor, name, obj) !== false) {
          reducedDescriptors[name] = descriptor;
        }
      });

      Object.defineProperties(obj, reducedDescriptors);
    };

    /**
     * Makes all methods read-only
     * @param {Object} obj
     */

    const freezeMethods = (obj) => {
      reduceDescriptors(obj, (descriptor, name) => {
        // skip restricted props in strict mode
        if (isFunction(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
          return false;
        }

        const value = obj[name];

        if (!isFunction(value)) return;

        descriptor.enumerable = false;

        if ('writable' in descriptor) {
          descriptor.writable = false;
          return;
        }

        if (!descriptor.set) {
          descriptor.set = () => {
            throw Error('Can not rewrite read-only method \'' + name + '\'');
          };
        }
      });
    };

    const toObjectSet = (arrayOrString, delimiter) => {
      const obj = {};

      const define = (arr) => {
        arr.forEach(value => {
          obj[value] = true;
        });
      };

      isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

      return obj;
    };

    const noop$2 = () => {};

    const toFiniteNumber = (value, defaultValue) => {
      value = +value;
      return Number.isFinite(value) ? value : defaultValue;
    };

    const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

    const DIGIT = '0123456789';

    const ALPHABET = {
      DIGIT,
      ALPHA,
      ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
    };

    const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
      let str = '';
      const {length} = alphabet;
      while (size--) {
        str += alphabet[Math.random() * length|0];
      }

      return str;
    };

    /**
     * If the thing is a FormData object, return true, otherwise return false.
     *
     * @param {unknown} thing - The thing to check.
     *
     * @returns {boolean}
     */
    function isSpecCompliantForm(thing) {
      return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator]);
    }

    const toJSONObject = (obj) => {
      const stack = new Array(10);

      const visit = (source, i) => {

        if (isObject(source)) {
          if (stack.indexOf(source) >= 0) {
            return;
          }

          if(!('toJSON' in source)) {
            stack[i] = source;
            const target = isArray(source) ? [] : {};

            forEach(source, (value, key) => {
              const reducedValue = visit(value, i + 1);
              !isUndefined(reducedValue) && (target[key] = reducedValue);
            });

            stack[i] = undefined;

            return target;
          }
        }

        return source;
      };

      return visit(obj, 0);
    };

    const isAsyncFn = kindOfTest('AsyncFunction');

    const isThenable = (thing) =>
      thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);

    var utils = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber,
      isBoolean,
      isObject,
      isPlainObject,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isRegExp,
      isFunction,
      isStream,
      isURLSearchParams,
      isTypedArray,
      isFileList,
      forEach,
      merge,
      extend,
      trim,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray: toArray$1,
      forEachEntry,
      matchAll,
      isHTMLForm,
      hasOwnProperty,
      hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
      reduceDescriptors,
      freezeMethods,
      toObjectSet,
      toCamelCase,
      noop: noop$2,
      toFiniteNumber,
      findKey,
      global: _global,
      isContextDefined,
      ALPHABET,
      generateString,
      isSpecCompliantForm,
      toJSONObject,
      isAsyncFn,
      isThenable
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     *
     * @returns {Error} The created error.
     */
    function AxiosError(message, code, config, request, response) {
      Error.call(this);

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = (new Error()).stack;
      }

      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }

    utils.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: utils.toJSONObject(this.config),
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });

    const prototype$1 = AxiosError.prototype;
    const descriptors = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED',
      'ERR_NOT_SUPPORT',
      'ERR_INVALID_URL'
    // eslint-disable-next-line func-names
    ].forEach(code => {
      descriptors[code] = {value: code};
    });

    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError.from = (error, code, config, request, response, customProps) => {
      const axiosError = Object.create(prototype$1);

      utils.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      }, prop => {
        return prop !== 'isAxiosError';
      });

      AxiosError.call(axiosError, error.message, code, config, request, response);

      axiosError.cause = error;

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    // eslint-disable-next-line strict
    var httpAdapter = null;

    /**
     * Determines if the given thing is a array or js object.
     *
     * @param {string} thing - The object or array to be visited.
     *
     * @returns {boolean}
     */
    function isVisitable(thing) {
      return utils.isPlainObject(thing) || utils.isArray(thing);
    }

    /**
     * It removes the brackets from the end of a string
     *
     * @param {string} key - The key of the parameter.
     *
     * @returns {string} the key without the brackets.
     */
    function removeBrackets(key) {
      return utils.endsWith(key, '[]') ? key.slice(0, -2) : key;
    }

    /**
     * It takes a path, a key, and a boolean, and returns a string
     *
     * @param {string} path - The path to the current key.
     * @param {string} key - The key of the current object being iterated over.
     * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
     *
     * @returns {string} The path to the current key.
     */
    function renderKey(path, key, dots) {
      if (!path) return key;
      return path.concat(key).map(function each(token, i) {
        // eslint-disable-next-line no-param-reassign
        token = removeBrackets(token);
        return !dots && i ? '[' + token + ']' : token;
      }).join(dots ? '.' : '');
    }

    /**
     * If the array is an array and none of its elements are visitable, then it's a flat array.
     *
     * @param {Array<any>} arr - The array to check
     *
     * @returns {boolean}
     */
    function isFlatArray(arr) {
      return utils.isArray(arr) && !arr.some(isVisitable);
    }

    const predicates = utils.toFlatObject(utils, {}, null, function filter(prop) {
      return /^is[A-Z]/.test(prop);
    });

    /**
     * Convert a data object to FormData
     *
     * @param {Object} obj
     * @param {?Object} [formData]
     * @param {?Object} [options]
     * @param {Function} [options.visitor]
     * @param {Boolean} [options.metaTokens = true]
     * @param {Boolean} [options.dots = false]
     * @param {?Boolean} [options.indexes = false]
     *
     * @returns {Object}
     **/

    /**
     * It converts an object into a FormData object
     *
     * @param {Object<any, any>} obj - The object to convert to form data.
     * @param {string} formData - The FormData object to append to.
     * @param {Object<string, any>} options
     *
     * @returns
     */
    function toFormData(obj, formData, options) {
      if (!utils.isObject(obj)) {
        throw new TypeError('target must be an object');
      }

      // eslint-disable-next-line no-param-reassign
      formData = formData || new (FormData)();

      // eslint-disable-next-line no-param-reassign
      options = utils.toFlatObject(options, {
        metaTokens: true,
        dots: false,
        indexes: false
      }, false, function defined(option, source) {
        // eslint-disable-next-line no-eq-null,eqeqeq
        return !utils.isUndefined(source[option]);
      });

      const metaTokens = options.metaTokens;
      // eslint-disable-next-line no-use-before-define
      const visitor = options.visitor || defaultVisitor;
      const dots = options.dots;
      const indexes = options.indexes;
      const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
      const useBlob = _Blob && utils.isSpecCompliantForm(formData);

      if (!utils.isFunction(visitor)) {
        throw new TypeError('visitor must be a function');
      }

      function convertValue(value) {
        if (value === null) return '';

        if (utils.isDate(value)) {
          return value.toISOString();
        }

        if (!useBlob && utils.isBlob(value)) {
          throw new AxiosError('Blob is not supported. Use a Buffer instead.');
        }

        if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
          return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      /**
       * Default visitor.
       *
       * @param {*} value
       * @param {String|Number} key
       * @param {Array<String|Number>} path
       * @this {FormData}
       *
       * @returns {boolean} return true to visit the each prop of the value recursively
       */
      function defaultVisitor(value, key, path) {
        let arr = value;

        if (value && !path && typeof value === 'object') {
          if (utils.endsWith(key, '{}')) {
            // eslint-disable-next-line no-param-reassign
            key = metaTokens ? key : key.slice(0, -2);
            // eslint-disable-next-line no-param-reassign
            value = JSON.stringify(value);
          } else if (
            (utils.isArray(value) && isFlatArray(value)) ||
            ((utils.isFileList(value) || utils.endsWith(key, '[]')) && (arr = utils.toArray(value))
            )) {
            // eslint-disable-next-line no-param-reassign
            key = removeBrackets(key);

            arr.forEach(function each(el, index) {
              !(utils.isUndefined(el) || el === null) && formData.append(
                // eslint-disable-next-line no-nested-ternary
                indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
                convertValue(el)
              );
            });
            return false;
          }
        }

        if (isVisitable(value)) {
          return true;
        }

        formData.append(renderKey(path, key, dots), convertValue(value));

        return false;
      }

      const stack = [];

      const exposedHelpers = Object.assign(predicates, {
        defaultVisitor,
        convertValue,
        isVisitable
      });

      function build(value, path) {
        if (utils.isUndefined(value)) return;

        if (stack.indexOf(value) !== -1) {
          throw Error('Circular reference detected in ' + path.join('.'));
        }

        stack.push(value);

        utils.forEach(value, function each(el, key) {
          const result = !(utils.isUndefined(el) || el === null) && visitor.call(
            formData, el, utils.isString(key) ? key.trim() : key, path, exposedHelpers
          );

          if (result === true) {
            build(el, path ? path.concat(key) : [key]);
          }
        });

        stack.pop();
      }

      if (!utils.isObject(obj)) {
        throw new TypeError('data must be an object');
      }

      build(obj);

      return formData;
    }

    /**
     * It encodes a string by replacing all characters that are not in the unreserved set with
     * their percent-encoded equivalents
     *
     * @param {string} str - The string to encode.
     *
     * @returns {string} The encoded string.
     */
    function encode$1(str) {
      const charMap = {
        '!': '%21',
        "'": '%27',
        '(': '%28',
        ')': '%29',
        '~': '%7E',
        '%20': '+',
        '%00': '\x00'
      };
      return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
        return charMap[match];
      });
    }

    /**
     * It takes a params object and converts it to a FormData object
     *
     * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
     * @param {Object<string, any>} options - The options object passed to the Axios constructor.
     *
     * @returns {void}
     */
    function AxiosURLSearchParams(params, options) {
      this._pairs = [];

      params && toFormData(params, this, options);
    }

    const prototype = AxiosURLSearchParams.prototype;

    prototype.append = function append(name, value) {
      this._pairs.push([name, value]);
    };

    prototype.toString = function toString(encoder) {
      const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode$1);
      } : encode$1;

      return this._pairs.map(function each(pair) {
        return _encode(pair[0]) + '=' + _encode(pair[1]);
      }, '').join('&');
    };

    /**
     * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
     * URI encoded counterparts
     *
     * @param {string} val The value to be encoded.
     *
     * @returns {string} The encoded value.
     */
    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @param {?object} options
     *
     * @returns {string} The formatted url
     */
    function buildURL(url, params, options) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }
      
      const _encode = options && options.encode || encode;

      const serializeFn = options && options.serialize;

      let serializedParams;

      if (serializeFn) {
        serializedParams = serializeFn(params, options);
      } else {
        serializedParams = utils.isURLSearchParams(params) ?
          params.toString() :
          new AxiosURLSearchParams(params, options).toString(_encode);
      }

      if (serializedParams) {
        const hashmarkIndex = url.indexOf("#");

        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    }

    class InterceptorManager {
      constructor() {
        this.handlers = [];
      }

      /**
       * Add a new interceptor to the stack
       *
       * @param {Function} fulfilled The function to handle `then` for a `Promise`
       * @param {Function} rejected The function to handle `reject` for a `Promise`
       *
       * @return {Number} An ID used to remove interceptor later
       */
      use(fulfilled, rejected, options) {
        this.handlers.push({
          fulfilled,
          rejected,
          synchronous: options ? options.synchronous : false,
          runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
      }

      /**
       * Remove an interceptor from the stack
       *
       * @param {Number} id The ID that was returned by `use`
       *
       * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
       */
      eject(id) {
        if (this.handlers[id]) {
          this.handlers[id] = null;
        }
      }

      /**
       * Clear all interceptors from the stack
       *
       * @returns {void}
       */
      clear() {
        if (this.handlers) {
          this.handlers = [];
        }
      }

      /**
       * Iterate over all the registered interceptors
       *
       * This method is particularly useful for skipping over any
       * interceptors that may have become `null` calling `eject`.
       *
       * @param {Function} fn The function to call for each interceptor
       *
       * @returns {void}
       */
      forEach(fn) {
        utils.forEach(this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      }
    }

    var InterceptorManager$1 = InterceptorManager;

    var transitionalDefaults = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

    var FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

    var Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     *
     * @returns {boolean}
     */
    const isStandardBrowserEnv = (() => {
      let product;
      if (typeof navigator !== 'undefined' && (
        (product = navigator.product) === 'ReactNative' ||
        product === 'NativeScript' ||
        product === 'NS')
      ) {
        return false;
      }

      return typeof window !== 'undefined' && typeof document !== 'undefined';
    })();

    /**
     * Determine if we're running in a standard browser webWorker environment
     *
     * Although the `isStandardBrowserEnv` method indicates that
     * `allows axios to run in a web worker`, the WebWorker will still be
     * filtered out due to its judgment standard
     * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
     * This leads to a problem when axios post `FormData` in webWorker
     */
     const isStandardBrowserWebWorkerEnv = (() => {
      return (
        typeof WorkerGlobalScope !== 'undefined' &&
        // eslint-disable-next-line no-undef
        self instanceof WorkerGlobalScope &&
        typeof self.importScripts === 'function'
      );
    })();


    var platform = {
      isBrowser: true,
      classes: {
        URLSearchParams: URLSearchParams$1,
        FormData: FormData$1,
        Blob: Blob$1
      },
      isStandardBrowserEnv,
      isStandardBrowserWebWorkerEnv,
      protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
    };

    function toURLEncodedForm(data, options) {
      return toFormData(data, new platform.classes.URLSearchParams(), Object.assign({
        visitor: function(value, key, path, helpers) {
          if (platform.isNode && utils.isBuffer(value)) {
            this.append(key, value.toString('base64'));
            return false;
          }

          return helpers.defaultVisitor.apply(this, arguments);
        }
      }, options));
    }

    /**
     * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
     *
     * @param {string} name - The name of the property to get.
     *
     * @returns An array of strings.
     */
    function parsePropPath(name) {
      // foo[x][y][z]
      // foo.x.y.z
      // foo-x-y-z
      // foo x y z
      return utils.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
        return match[0] === '[]' ? '' : match[1] || match[0];
      });
    }

    /**
     * Convert an array to an object.
     *
     * @param {Array<any>} arr - The array to convert to an object.
     *
     * @returns An object with the same keys and values as the array.
     */
    function arrayToObject(arr) {
      const obj = {};
      const keys = Object.keys(arr);
      let i;
      const len = keys.length;
      let key;
      for (i = 0; i < len; i++) {
        key = keys[i];
        obj[key] = arr[key];
      }
      return obj;
    }

    /**
     * It takes a FormData object and returns a JavaScript object
     *
     * @param {string} formData The FormData object to convert to JSON.
     *
     * @returns {Object<string, any> | null} The converted object.
     */
    function formDataToJSON(formData) {
      function buildPath(path, value, target, index) {
        let name = path[index++];
        const isNumericKey = Number.isFinite(+name);
        const isLast = index >= path.length;
        name = !name && utils.isArray(target) ? target.length : name;

        if (isLast) {
          if (utils.hasOwnProp(target, name)) {
            target[name] = [target[name], value];
          } else {
            target[name] = value;
          }

          return !isNumericKey;
        }

        if (!target[name] || !utils.isObject(target[name])) {
          target[name] = [];
        }

        const result = buildPath(path, value, target[name], index);

        if (result && utils.isArray(target[name])) {
          target[name] = arrayToObject(target[name]);
        }

        return !isNumericKey;
      }

      if (utils.isFormData(formData) && utils.isFunction(formData.entries)) {
        const obj = {};

        utils.forEachEntry(formData, (name, value) => {
          buildPath(parsePropPath(name), value, obj, 0);
        });

        return obj;
      }

      return null;
    }

    const DEFAULT_CONTENT_TYPE = {
      'Content-Type': undefined
    };

    /**
     * It takes a string, tries to parse it, and if it fails, it returns the stringified version
     * of the input
     *
     * @param {any} rawValue - The value to be stringified.
     * @param {Function} parser - A function that parses a string into a JavaScript object.
     * @param {Function} encoder - A function that takes a value and returns a string.
     *
     * @returns {string} A stringified version of the rawValue.
     */
    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    const defaults$1 = {

      transitional: transitionalDefaults,

      adapter: ['xhr', 'http'],

      transformRequest: [function transformRequest(data, headers) {
        const contentType = headers.getContentType() || '';
        const hasJSONContentType = contentType.indexOf('application/json') > -1;
        const isObjectPayload = utils.isObject(data);

        if (isObjectPayload && utils.isHTMLForm(data)) {
          data = new FormData(data);
        }

        const isFormData = utils.isFormData(data);

        if (isFormData) {
          if (!hasJSONContentType) {
            return data;
          }
          return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
        }

        if (utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
          return data.toString();
        }

        let isFileList;

        if (isObjectPayload) {
          if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
            return toURLEncodedForm(data, this.formSerializer).toString();
          }

          if ((isFileList = utils.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
            const _FormData = this.env && this.env.FormData;

            return toFormData(
              isFileList ? {'files[]': data} : data,
              _FormData && new _FormData(),
              this.formSerializer
            );
          }
        }

        if (isObjectPayload || hasJSONContentType ) {
          headers.setContentType('application/json', false);
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        const transitional = this.transitional || defaults$1.transitional;
        const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        const JSONRequested = this.responseType === 'json';

        if (data && utils.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
          const silentJSONParsing = transitional && transitional.silentJSONParsing;
          const strictJSONParsing = !silentJSONParsing && JSONRequested;

          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: platform.classes.FormData,
        Blob: platform.classes.Blob
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults$1.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults$1.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults$2 = defaults$1;

    // RawAxiosHeaders whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    const ignoreDuplicateOf = utils.toObjectSet([
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ]);

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} rawHeaders Headers needing to be parsed
     *
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = rawHeaders => {
      const parsed = {};
      let key;
      let val;
      let i;

      rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
        i = line.indexOf(':');
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();

        if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
          return;
        }

        if (key === 'set-cookie') {
          if (parsed[key]) {
            parsed[key].push(val);
          } else {
            parsed[key] = [val];
          }
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      });

      return parsed;
    };

    const $internals = Symbol('internals');

    function normalizeHeader(header) {
      return header && String(header).trim().toLowerCase();
    }

    function normalizeValue(value) {
      if (value === false || value == null) {
        return value;
      }

      return utils.isArray(value) ? value.map(normalizeValue) : String(value);
    }

    function parseTokens(str) {
      const tokens = Object.create(null);
      const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
      let match;

      while ((match = tokensRE.exec(str))) {
        tokens[match[1]] = match[2];
      }

      return tokens;
    }

    const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

    function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
      if (utils.isFunction(filter)) {
        return filter.call(this, value, header);
      }

      if (isHeaderNameFilter) {
        value = header;
      }

      if (!utils.isString(value)) return;

      if (utils.isString(filter)) {
        return value.indexOf(filter) !== -1;
      }

      if (utils.isRegExp(filter)) {
        return filter.test(value);
      }
    }

    function formatHeader(header) {
      return header.trim()
        .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
          return char.toUpperCase() + str;
        });
    }

    function buildAccessors(obj, header) {
      const accessorName = utils.toCamelCase(' ' + header);

      ['get', 'set', 'has'].forEach(methodName => {
        Object.defineProperty(obj, methodName + accessorName, {
          value: function(arg1, arg2, arg3) {
            return this[methodName].call(this, header, arg1, arg2, arg3);
          },
          configurable: true
        });
      });
    }

    class AxiosHeaders {
      constructor(headers) {
        headers && this.set(headers);
      }

      set(header, valueOrRewrite, rewrite) {
        const self = this;

        function setHeader(_value, _header, _rewrite) {
          const lHeader = normalizeHeader(_header);

          if (!lHeader) {
            throw new Error('header name must be a non-empty string');
          }

          const key = utils.findKey(self, lHeader);

          if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
            self[key || _header] = normalizeValue(_value);
          }
        }

        const setHeaders = (headers, _rewrite) =>
          utils.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

        if (utils.isPlainObject(header) || header instanceof this.constructor) {
          setHeaders(header, valueOrRewrite);
        } else if(utils.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
          setHeaders(parseHeaders(header), valueOrRewrite);
        } else {
          header != null && setHeader(valueOrRewrite, header, rewrite);
        }

        return this;
      }

      get(header, parser) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils.findKey(this, header);

          if (key) {
            const value = this[key];

            if (!parser) {
              return value;
            }

            if (parser === true) {
              return parseTokens(value);
            }

            if (utils.isFunction(parser)) {
              return parser.call(this, value, key);
            }

            if (utils.isRegExp(parser)) {
              return parser.exec(value);
            }

            throw new TypeError('parser must be boolean|regexp|function');
          }
        }
      }

      has(header, matcher) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils.findKey(this, header);

          return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }

        return false;
      }

      delete(header, matcher) {
        const self = this;
        let deleted = false;

        function deleteHeader(_header) {
          _header = normalizeHeader(_header);

          if (_header) {
            const key = utils.findKey(self, _header);

            if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
              delete self[key];

              deleted = true;
            }
          }
        }

        if (utils.isArray(header)) {
          header.forEach(deleteHeader);
        } else {
          deleteHeader(header);
        }

        return deleted;
      }

      clear(matcher) {
        const keys = Object.keys(this);
        let i = keys.length;
        let deleted = false;

        while (i--) {
          const key = keys[i];
          if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
            delete this[key];
            deleted = true;
          }
        }

        return deleted;
      }

      normalize(format) {
        const self = this;
        const headers = {};

        utils.forEach(this, (value, header) => {
          const key = utils.findKey(headers, header);

          if (key) {
            self[key] = normalizeValue(value);
            delete self[header];
            return;
          }

          const normalized = format ? formatHeader(header) : String(header).trim();

          if (normalized !== header) {
            delete self[header];
          }

          self[normalized] = normalizeValue(value);

          headers[normalized] = true;
        });

        return this;
      }

      concat(...targets) {
        return this.constructor.concat(this, ...targets);
      }

      toJSON(asStrings) {
        const obj = Object.create(null);

        utils.forEach(this, (value, header) => {
          value != null && value !== false && (obj[header] = asStrings && utils.isArray(value) ? value.join(', ') : value);
        });

        return obj;
      }

      [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }

      toString() {
        return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
      }

      get [Symbol.toStringTag]() {
        return 'AxiosHeaders';
      }

      static from(thing) {
        return thing instanceof this ? thing : new this(thing);
      }

      static concat(first, ...targets) {
        const computed = new this(first);

        targets.forEach((target) => computed.set(target));

        return computed;
      }

      static accessor(header) {
        const internals = this[$internals] = (this[$internals] = {
          accessors: {}
        });

        const accessors = internals.accessors;
        const prototype = this.prototype;

        function defineAccessor(_header) {
          const lHeader = normalizeHeader(_header);

          if (!accessors[lHeader]) {
            buildAccessors(prototype, _header);
            accessors[lHeader] = true;
          }
        }

        utils.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

        return this;
      }
    }

    AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

    utils.freezeMethods(AxiosHeaders.prototype);
    utils.freezeMethods(AxiosHeaders);

    var AxiosHeaders$1 = AxiosHeaders;

    /**
     * Transform the data for a request or a response
     *
     * @param {Array|Function} fns A single function or Array of functions
     * @param {?Object} response The response object
     *
     * @returns {*} The resulting transformed data
     */
    function transformData(fns, response) {
      const config = this || defaults$2;
      const context = response || config;
      const headers = AxiosHeaders$1.from(context.headers);
      let data = context.data;

      utils.forEach(fns, function transform(fn) {
        data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
      });

      headers.normalize();

      return data;
    }

    function isCancel(value) {
      return !!(value && value.__CANCEL__);
    }

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @param {string=} message The message.
     * @param {Object=} config The config.
     * @param {Object=} request The request.
     *
     * @returns {CanceledError} The created error.
     */
    function CanceledError(message, config, request) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED, config, request);
      this.name = 'CanceledError';
    }

    utils.inherits(CanceledError, AxiosError, {
      __CANCEL__: true
    });

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     *
     * @returns {object} The response.
     */
    function settle(resolve, reject, response) {
      const validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError(
          'Request failed with status code ' + response.status,
          [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    }

    var cookies = platform.isStandardBrowserEnv ?

    // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            const cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

    // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })();

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     *
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    }

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     *
     * @returns {string} The combined URL
     */
    function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    }

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     *
     * @returns {string} The combined full path
     */
    function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    }

    var isURLSameOrigin = platform.isStandardBrowserEnv ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        const msie = /(msie|trident)/i.test(navigator.userAgent);
        const urlParsingNode = document.createElement('a');
        let originURL;

        /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
        function resolveURL(url) {
          let href = url;

          if (msie) {
            // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
        return function isURLSameOrigin(requestURL) {
          const parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })();

    function parseProtocol(url) {
      const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    }

    /**
     * Calculate data maxRate
     * @param {Number} [samplesCount= 10]
     * @param {Number} [min= 1000]
     * @returns {Function}
     */
    function speedometer(samplesCount, min) {
      samplesCount = samplesCount || 10;
      const bytes = new Array(samplesCount);
      const timestamps = new Array(samplesCount);
      let head = 0;
      let tail = 0;
      let firstSampleTS;

      min = min !== undefined ? min : 1000;

      return function push(chunkLength) {
        const now = Date.now();

        const startedAt = timestamps[tail];

        if (!firstSampleTS) {
          firstSampleTS = now;
        }

        bytes[head] = chunkLength;
        timestamps[head] = now;

        let i = tail;
        let bytesCount = 0;

        while (i !== head) {
          bytesCount += bytes[i++];
          i = i % samplesCount;
        }

        head = (head + 1) % samplesCount;

        if (head === tail) {
          tail = (tail + 1) % samplesCount;
        }

        if (now - firstSampleTS < min) {
          return;
        }

        const passed = startedAt && now - startedAt;

        return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
      };
    }

    function progressEventReducer(listener, isDownloadStream) {
      let bytesNotified = 0;
      const _speedometer = speedometer(50, 250);

      return e => {
        const loaded = e.loaded;
        const total = e.lengthComputable ? e.total : undefined;
        const progressBytes = loaded - bytesNotified;
        const rate = _speedometer(progressBytes);
        const inRange = loaded <= total;

        bytesNotified = loaded;

        const data = {
          loaded,
          total,
          progress: total ? (loaded / total) : undefined,
          bytes: progressBytes,
          rate: rate ? rate : undefined,
          estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
          event: e
        };

        data[isDownloadStream ? 'download' : 'upload'] = true;

        listener(data);
      };
    }

    const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

    var xhrAdapter = isXHRAdapterSupported && function (config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        let requestData = config.data;
        const requestHeaders = AxiosHeaders$1.from(config.headers).normalize();
        const responseType = config.responseType;
        let onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData)) {
          if (platform.isStandardBrowserEnv || platform.isStandardBrowserWebWorkerEnv) {
            requestHeaders.setContentType(false); // Let the browser set it
          } else {
            requestHeaders.setContentType('multipart/form-data;', false); // mobile/desktop app frameworks
          }
        }

        let request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          const username = config.auth.username || '';
          const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.set('Authorization', 'Basic ' + btoa(username + ':' + password));
        }

        const fullPath = buildFullPath(config.baseURL, config.url);

        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          const responseHeaders = AxiosHeaders$1.from(
            'getAllResponseHeaders' in request && request.getAllResponseHeaders()
          );
          const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
            request.responseText : request.response;
          const response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          let timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          const transitional = config.transitional || transitionalDefaults;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
            config,
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (platform.isStandardBrowserEnv) {
          // Add xsrf header
          const xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath))
            && config.xsrfCookieName && cookies.read(config.xsrfCookieName);

          if (xsrfValue) {
            requestHeaders.set(config.xsrfHeaderName, xsrfValue);
          }
        }

        // Remove Content-Type if data is undefined
        requestData === undefined && requestHeaders.setContentType(null);

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
            request.setRequestHeader(key, val);
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', progressEventReducer(config.onDownloadProgress, true));
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', progressEventReducer(config.onUploadProgress));
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = cancel => {
            if (!request) {
              return;
            }
            reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        const protocol = parseProtocol(fullPath);

        if (protocol && platform.protocols.indexOf(protocol) === -1) {
          reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData || null);
      });
    };

    const knownAdapters = {
      http: httpAdapter,
      xhr: xhrAdapter
    };

    utils.forEach(knownAdapters, (fn, value) => {
      if(fn) {
        try {
          Object.defineProperty(fn, 'name', {value});
        } catch (e) {
          // eslint-disable-next-line no-empty
        }
        Object.defineProperty(fn, 'adapterName', {value});
      }
    });

    var adapters = {
      getAdapter: (adapters) => {
        adapters = utils.isArray(adapters) ? adapters : [adapters];

        const {length} = adapters;
        let nameOrAdapter;
        let adapter;

        for (let i = 0; i < length; i++) {
          nameOrAdapter = adapters[i];
          if((adapter = utils.isString(nameOrAdapter) ? knownAdapters[nameOrAdapter.toLowerCase()] : nameOrAdapter)) {
            break;
          }
        }

        if (!adapter) {
          if (adapter === false) {
            throw new AxiosError(
              `Adapter ${nameOrAdapter} is not supported by the environment`,
              'ERR_NOT_SUPPORT'
            );
          }

          throw new Error(
            utils.hasOwnProp(knownAdapters, nameOrAdapter) ?
              `Adapter '${nameOrAdapter}' is not available in the build` :
              `Unknown adapter '${nameOrAdapter}'`
          );
        }

        if (!utils.isFunction(adapter)) {
          throw new TypeError('adapter is not a function');
        }

        return adapter;
      },
      adapters: knownAdapters
    };

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     *
     * @param {Object} config The config that is to be used for the request
     *
     * @returns {void}
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError(null, config);
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      config.headers = AxiosHeaders$1.from(config.headers);

      // Transform request data
      config.data = transformData.call(
        config,
        config.transformRequest
      );

      if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
        config.headers.setContentType('application/x-www-form-urlencoded', false);
      }

      const adapter = adapters.getAdapter(config.adapter || defaults$2.adapter);

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          config.transformResponse,
          response
        );

        response.headers = AxiosHeaders$1.from(response.headers);

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              config.transformResponse,
              reason.response
            );
            reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
          }
        }

        return Promise.reject(reason);
      });
    }

    const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? thing.toJSON() : thing;

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     *
     * @returns {Object} New object resulting from merging config2 to config1
     */
    function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      const config = {};

      function getMergedValue(target, source, caseless) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge.call({caseless}, target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(a, b, caseless) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(a, b, caseless);
        } else if (!utils.isUndefined(a)) {
          return getMergedValue(undefined, a, caseless);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(a, b) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(undefined, b);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(a, b) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(undefined, b);
        } else if (!utils.isUndefined(a)) {
          return getMergedValue(undefined, a);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(a, b, prop) {
        if (prop in config2) {
          return getMergedValue(a, b);
        } else if (prop in config1) {
          return getMergedValue(undefined, a);
        }
      }

      const mergeMap = {
        url: valueFromConfig2,
        method: valueFromConfig2,
        data: valueFromConfig2,
        baseURL: defaultToConfig2,
        transformRequest: defaultToConfig2,
        transformResponse: defaultToConfig2,
        paramsSerializer: defaultToConfig2,
        timeout: defaultToConfig2,
        timeoutMessage: defaultToConfig2,
        withCredentials: defaultToConfig2,
        adapter: defaultToConfig2,
        responseType: defaultToConfig2,
        xsrfCookieName: defaultToConfig2,
        xsrfHeaderName: defaultToConfig2,
        onUploadProgress: defaultToConfig2,
        onDownloadProgress: defaultToConfig2,
        decompress: defaultToConfig2,
        maxContentLength: defaultToConfig2,
        maxBodyLength: defaultToConfig2,
        beforeRedirect: defaultToConfig2,
        transport: defaultToConfig2,
        httpAgent: defaultToConfig2,
        httpsAgent: defaultToConfig2,
        cancelToken: defaultToConfig2,
        socketPath: defaultToConfig2,
        responseEncoding: defaultToConfig2,
        validateStatus: mergeDirectKeys,
        headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
      };

      utils.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
        const merge = mergeMap[prop] || mergeDeepProperties;
        const configValue = merge(config1[prop], config2[prop], prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    }

    const VERSION = "1.4.0";

    const validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    const deprecatedWarnings = {};

    /**
     * Transitional option validator
     *
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     *
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return (value, opt, opts) => {
        if (validator === false) {
          throw new AxiosError(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     *
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     *
     * @returns {object}
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
      }
      const keys = Object.keys(options);
      let i = keys.length;
      while (i-- > 0) {
        const opt = keys[i];
        const validator = schema[opt];
        if (validator) {
          const value = options[opt];
          const result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
        }
      }
    }

    var validator = {
      assertOptions,
      validators: validators$1
    };

    const validators = validator.validators;

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     *
     * @return {Axios} A new instance of Axios
     */
    class Axios {
      constructor(instanceConfig) {
        this.defaults = instanceConfig;
        this.interceptors = {
          request: new InterceptorManager$1(),
          response: new InterceptorManager$1()
        };
      }

      /**
       * Dispatch a request
       *
       * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
       * @param {?Object} config
       *
       * @returns {Promise} The Promise to be fulfilled
       */
      request(configOrUrl, config) {
        /*eslint no-param-reassign:0*/
        // Allow for axios('example/url'[, config]) a la fetch API
        if (typeof configOrUrl === 'string') {
          config = config || {};
          config.url = configOrUrl;
        } else {
          config = configOrUrl || {};
        }

        config = mergeConfig(this.defaults, config);

        const {transitional, paramsSerializer, headers} = config;

        if (transitional !== undefined) {
          validator.assertOptions(transitional, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, false);
        }

        if (paramsSerializer != null) {
          if (utils.isFunction(paramsSerializer)) {
            config.paramsSerializer = {
              serialize: paramsSerializer
            };
          } else {
            validator.assertOptions(paramsSerializer, {
              encode: validators.function,
              serialize: validators.function
            }, true);
          }
        }

        // Set config.method
        config.method = (config.method || this.defaults.method || 'get').toLowerCase();

        let contextHeaders;

        // Flatten headers
        contextHeaders = headers && utils.merge(
          headers.common,
          headers[config.method]
        );

        contextHeaders && utils.forEach(
          ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
          (method) => {
            delete headers[method];
          }
        );

        config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

        // filter out skipped interceptors
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
          if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
            return;
          }

          synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

          requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });

        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });

        let promise;
        let i = 0;
        let len;

        if (!synchronousRequestInterceptors) {
          const chain = [dispatchRequest.bind(this), undefined];
          chain.unshift.apply(chain, requestInterceptorChain);
          chain.push.apply(chain, responseInterceptorChain);
          len = chain.length;

          promise = Promise.resolve(config);

          while (i < len) {
            promise = promise.then(chain[i++], chain[i++]);
          }

          return promise;
        }

        len = requestInterceptorChain.length;

        let newConfig = config;

        i = 0;

        while (i < len) {
          const onFulfilled = requestInterceptorChain[i++];
          const onRejected = requestInterceptorChain[i++];
          try {
            newConfig = onFulfilled(newConfig);
          } catch (error) {
            onRejected.call(this, error);
            break;
          }
        }

        try {
          promise = dispatchRequest.call(this, newConfig);
        } catch (error) {
          return Promise.reject(error);
        }

        i = 0;
        len = responseInterceptorChain.length;

        while (i < len) {
          promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }

        return promise;
      }

      getUri(config) {
        config = mergeConfig(this.defaults, config);
        const fullPath = buildFullPath(config.baseURL, config.url);
        return buildURL(fullPath, config.params, config.paramsSerializer);
      }
    }

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig(config || {}, {
            method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url,
            data
          }));
        };
      }

      Axios.prototype[method] = generateHTTPMethod();

      Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    var Axios$1 = Axios;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @param {Function} executor The executor function.
     *
     * @returns {CancelToken}
     */
    class CancelToken {
      constructor(executor) {
        if (typeof executor !== 'function') {
          throw new TypeError('executor must be a function.');
        }

        let resolvePromise;

        this.promise = new Promise(function promiseExecutor(resolve) {
          resolvePromise = resolve;
        });

        const token = this;

        // eslint-disable-next-line func-names
        this.promise.then(cancel => {
          if (!token._listeners) return;

          let i = token._listeners.length;

          while (i-- > 0) {
            token._listeners[i](cancel);
          }
          token._listeners = null;
        });

        // eslint-disable-next-line func-names
        this.promise.then = onfulfilled => {
          let _resolve;
          // eslint-disable-next-line func-names
          const promise = new Promise(resolve => {
            token.subscribe(resolve);
            _resolve = resolve;
          }).then(onfulfilled);

          promise.cancel = function reject() {
            token.unsubscribe(_resolve);
          };

          return promise;
        };

        executor(function cancel(message, config, request) {
          if (token.reason) {
            // Cancellation has already been requested
            return;
          }

          token.reason = new CanceledError(message, config, request);
          resolvePromise(token.reason);
        });
      }

      /**
       * Throws a `CanceledError` if cancellation has been requested.
       */
      throwIfRequested() {
        if (this.reason) {
          throw this.reason;
        }
      }

      /**
       * Subscribe to the cancel signal
       */

      subscribe(listener) {
        if (this.reason) {
          listener(this.reason);
          return;
        }

        if (this._listeners) {
          this._listeners.push(listener);
        } else {
          this._listeners = [listener];
        }
      }

      /**
       * Unsubscribe from the cancel signal
       */

      unsubscribe(listener) {
        if (!this._listeners) {
          return;
        }
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
          this._listeners.splice(index, 1);
        }
      }

      /**
       * Returns an object that contains a new `CancelToken` and a function that, when called,
       * cancels the `CancelToken`.
       */
      static source() {
        let cancel;
        const token = new CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token,
          cancel
        };
      }
    }

    var CancelToken$1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     *
     * @returns {Function}
     */
    function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    }

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     *
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    function isAxiosError(payload) {
      return utils.isObject(payload) && (payload.isAxiosError === true);
    }

    const HttpStatusCode = {
      Continue: 100,
      SwitchingProtocols: 101,
      Processing: 102,
      EarlyHints: 103,
      Ok: 200,
      Created: 201,
      Accepted: 202,
      NonAuthoritativeInformation: 203,
      NoContent: 204,
      ResetContent: 205,
      PartialContent: 206,
      MultiStatus: 207,
      AlreadyReported: 208,
      ImUsed: 226,
      MultipleChoices: 300,
      MovedPermanently: 301,
      Found: 302,
      SeeOther: 303,
      NotModified: 304,
      UseProxy: 305,
      Unused: 306,
      TemporaryRedirect: 307,
      PermanentRedirect: 308,
      BadRequest: 400,
      Unauthorized: 401,
      PaymentRequired: 402,
      Forbidden: 403,
      NotFound: 404,
      MethodNotAllowed: 405,
      NotAcceptable: 406,
      ProxyAuthenticationRequired: 407,
      RequestTimeout: 408,
      Conflict: 409,
      Gone: 410,
      LengthRequired: 411,
      PreconditionFailed: 412,
      PayloadTooLarge: 413,
      UriTooLong: 414,
      UnsupportedMediaType: 415,
      RangeNotSatisfiable: 416,
      ExpectationFailed: 417,
      ImATeapot: 418,
      MisdirectedRequest: 421,
      UnprocessableEntity: 422,
      Locked: 423,
      FailedDependency: 424,
      TooEarly: 425,
      UpgradeRequired: 426,
      PreconditionRequired: 428,
      TooManyRequests: 429,
      RequestHeaderFieldsTooLarge: 431,
      UnavailableForLegalReasons: 451,
      InternalServerError: 500,
      NotImplemented: 501,
      BadGateway: 502,
      ServiceUnavailable: 503,
      GatewayTimeout: 504,
      HttpVersionNotSupported: 505,
      VariantAlsoNegotiates: 506,
      InsufficientStorage: 507,
      LoopDetected: 508,
      NotExtended: 510,
      NetworkAuthenticationRequired: 511,
    };

    Object.entries(HttpStatusCode).forEach(([key, value]) => {
      HttpStatusCode[value] = key;
    });

    var HttpStatusCode$1 = HttpStatusCode;

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     *
     * @returns {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      const context = new Axios$1(defaultConfig);
      const instance = bind(Axios$1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios$1.prototype, context, {allOwnKeys: true});

      // Copy context to instance
      utils.extend(instance, context, null, {allOwnKeys: true});

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    const axios = createInstance(defaults$2);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios$1;

    // Expose Cancel & CancelToken
    axios.CanceledError = CanceledError;
    axios.CancelToken = CancelToken$1;
    axios.isCancel = isCancel;
    axios.VERSION = VERSION;
    axios.toFormData = toFormData;

    // Expose AxiosError class
    axios.AxiosError = AxiosError;

    // alias for CanceledError for backward compatibility
    axios.Cancel = axios.CanceledError;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };

    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    // Expose mergeConfig
    axios.mergeConfig = mergeConfig;

    axios.AxiosHeaders = AxiosHeaders$1;

    axios.formToJSON = thing => formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);

    axios.HttpStatusCode = HttpStatusCode$1;

    axios.default = axios;

    // this module should only have a default export
    var axios$1 = axios;

    var e={"":["<em>","</em>"],_:["<strong>","</strong>"],"*":["<strong>","</strong>"],"~":["<s>","</s>"],"\n":["<br />"]," ":["<br />"],"-":["<hr />"]};function n(e){return e.replace(RegExp("^"+(e.match(/^(\t| )+/)||"")[0],"gm"),"")}function r(e){return (e+"").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function t(a,c){var o,l,g,s,p,u=/((?:^|\n+)(?:\n---+|\* \*(?: \*)+)\n)|(?:^``` *(\w*)\n([\s\S]*?)\n```$)|((?:(?:^|\n+)(?:\t|  {2,}).+)+\n*)|((?:(?:^|\n)([>*+-]|\d+\.)\s+.*)+)|(?:!\[([^\]]*?)\]\(([^)]+?)\))|(\[)|(\](?:\(([^)]+?)\))?)|(?:(?:^|\n+)([^\s].*)\n(-{3,}|={3,})(?:\n+|$))|(?:(?:^|\n+)(#{1,6})\s*(.+)(?:\n+|$))|(?:`([^`].*?)`)|(  \n\n*|\n{2,}|__|\*\*|[_*]|~~)/gm,m=[],h="",i=c||{},d=0;function f(n){var r=e[n[1]||""],t=m[m.length-1]==n;return r?r[1]?(t?m.pop():m.push(n),r[0|t]):r[0]:n}function $(){for(var e="";m.length;)e+=f(m[m.length-1]);return e}for(a=a.replace(/^\[(.+?)\]:\s*(.+)$/gm,function(e,n,r){return i[n.toLowerCase()]=r,""}).replace(/^\n+|\n+$/g,"");g=u.exec(a);)l=a.substring(d,g.index),d=u.lastIndex,o=g[0],l.match(/[^\\](\\\\)*\\$/)||((p=g[3]||g[4])?o='<pre class="code '+(g[4]?"poetry":g[2].toLowerCase())+'"><code'+(g[2]?' class="language-'+g[2].toLowerCase()+'"':"")+">"+n(r(p).replace(/^\n+|\n+$/g,""))+"</code></pre>":(p=g[6])?(p.match(/\./)&&(g[5]=g[5].replace(/^\d+/gm,"")),s=t(n(g[5].replace(/^\s*[>*+.-]/gm,""))),">"==p?p="blockquote":(p=p.match(/\./)?"ol":"ul",s=s.replace(/^(.*)(\n|$)/gm,"<li>$1</li>")),o="<"+p+">"+s+"</"+p+">"):g[8]?o='<img src="'+r(g[8])+'" alt="'+r(g[7])+'">':g[10]?(h=h.replace("<a>",'<a href="'+r(g[11]||i[l.toLowerCase()])+'">'),o=$()+"</a>"):g[9]?o="<a>":g[12]||g[14]?o="<"+(p="h"+(g[14]?g[14].length:g[13]>"="?1:2))+">"+t(g[12]||g[15],i)+"</"+p+">":g[16]?o="<code>"+r(g[16])+"</code>":(g[17]||g[1])&&(o=f(g[17]||"--"))),h+=l,h+=o;return (h+a.substring(d)+$()).replace(/^\n+|\n+$/g,"")}

    const durationUnitRegex = /[a-zA-Z]/;
    const range = (size, startAt = 0) => [...Array(size).keys()].map((i) => i + startAt);
    // export const characterRange = (startChar, endChar) =>
    //   String.fromCharCode(
    //     ...range(
    //       endChar.charCodeAt(0) - startChar.charCodeAt(0),
    //       startChar.charCodeAt(0)
    //     )
    //   );
    // export const zip = (arr, ...arrs) =>
    //   arr.map((val, i) => arrs.reduce((list, curr) => [...list, curr[i]], [val]));

    /* node_modules\.pnpm\svelte-loading-spinners@0.3.4\node_modules\svelte-loading-spinners\Pulse.svelte generated by Svelte v3.59.1 */
    const file$3 = "node_modules\\.pnpm\\svelte-loading-spinners@0.3.4\\node_modules\\svelte-loading-spinners\\Pulse.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (12:1) {#each range(3, 0) as version}
    function create_each_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "cube svelte-1w8rpx6");
    			set_style(div, "animation-delay", /*version*/ ctx[7] * (+/*durationNum*/ ctx[6] / 10) + /*durationUnit*/ ctx[5]);
    			set_style(div, "left", /*version*/ ctx[7] * (+/*size*/ ctx[3] / 3 + +/*size*/ ctx[3] / 15) + /*unit*/ ctx[1]);
    			toggle_class(div, "pause-animation", /*pause*/ ctx[4]);
    			add_location(div, file$3, 12, 2, 465);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*size, unit*/ 10) {
    				set_style(div, "left", /*version*/ ctx[7] * (+/*size*/ ctx[3] / 3 + +/*size*/ ctx[3] / 15) + /*unit*/ ctx[1]);
    			}

    			if (dirty & /*pause*/ 16) {
    				toggle_class(div, "pause-animation", /*pause*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(12:1) {#each range(3, 0) as version}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let each_value = range(3, 0);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "wrapper svelte-1w8rpx6");
    			set_style(div, "--size", /*size*/ ctx[3] + /*unit*/ ctx[1]);
    			set_style(div, "--color", /*color*/ ctx[0]);
    			set_style(div, "--duration", /*duration*/ ctx[2]);
    			add_location(div, file$3, 10, 0, 338);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*range, durationNum, durationUnit, size, unit, pause*/ 122) {
    				each_value = range(3, 0);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*size, unit*/ 10) {
    				set_style(div, "--size", /*size*/ ctx[3] + /*unit*/ ctx[1]);
    			}

    			if (dirty & /*color*/ 1) {
    				set_style(div, "--color", /*color*/ ctx[0]);
    			}

    			if (dirty & /*duration*/ 4) {
    				set_style(div, "--duration", /*duration*/ ctx[2]);
    			}
    		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Pulse', slots, []);
    	let { color = '#FF3E00' } = $$props;
    	let { unit = 'px' } = $$props;
    	let { duration = '1.5s' } = $$props;
    	let { size = '60' } = $$props;
    	let { pause = false } = $$props;
    	let durationUnit = duration.match(durationUnitRegex)?.[0] ?? 's';
    	let durationNum = duration.replace(durationUnitRegex, '');
    	const writable_props = ['color', 'unit', 'duration', 'size', 'pause'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Pulse> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('pause' in $$props) $$invalidate(4, pause = $$props.pause);
    	};

    	$$self.$capture_state = () => ({
    		range,
    		durationUnitRegex,
    		color,
    		unit,
    		duration,
    		size,
    		pause,
    		durationUnit,
    		durationNum
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('pause' in $$props) $$invalidate(4, pause = $$props.pause);
    		if ('durationUnit' in $$props) $$invalidate(5, durationUnit = $$props.durationUnit);
    		if ('durationNum' in $$props) $$invalidate(6, durationNum = $$props.durationNum);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, unit, duration, size, pause, durationUnit, durationNum];
    }

    class Pulse extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			color: 0,
    			unit: 1,
    			duration: 2,
    			size: 3,
    			pause: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pulse",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get color() {
    		throw new Error("<Pulse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Pulse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unit() {
    		throw new Error("<Pulse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unit(value) {
    		throw new Error("<Pulse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Pulse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Pulse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Pulse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Pulse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pause() {
    		throw new Error("<Pulse>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pause(value) {
    		throw new Error("<Pulse>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var __awaiter$d = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const resolveFetch$3 = (customFetch) => {
        let _fetch;
        if (customFetch) {
            _fetch = customFetch;
        }
        else if (typeof fetch === 'undefined') {
            _fetch = (...args) => __awaiter$d(void 0, void 0, void 0, function* () { return yield (yield Promise.resolve().then(function () { return browserPonyfill; })).fetch(...args); });
        }
        else {
            _fetch = fetch;
        }
        return (...args) => _fetch(...args);
    };

    class FunctionsError extends Error {
        constructor(message, name = 'FunctionsError', context) {
            super(message);
            this.name = name;
            this.context = context;
        }
    }
    class FunctionsFetchError extends FunctionsError {
        constructor(context) {
            super('Failed to send a request to the Edge Function', 'FunctionsFetchError', context);
        }
    }
    class FunctionsRelayError extends FunctionsError {
        constructor(context) {
            super('Relay Error invoking the Edge Function', 'FunctionsRelayError', context);
        }
    }
    class FunctionsHttpError extends FunctionsError {
        constructor(context) {
            super('Edge Function returned a non-2xx status code', 'FunctionsHttpError', context);
        }
    }

    var __awaiter$c = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class FunctionsClient {
        constructor(url, { headers = {}, customFetch, } = {}) {
            this.url = url;
            this.headers = headers;
            this.fetch = resolveFetch$3(customFetch);
        }
        /**
         * Updates the authorization header
         * @param token - the new jwt token sent in the authorisation header
         */
        setAuth(token) {
            this.headers.Authorization = `Bearer ${token}`;
        }
        /**
         * Invokes a function
         * @param functionName - The name of the Function to invoke.
         * @param options - Options for invoking the Function.
         */
        invoke(functionName, options = {}) {
            var _a;
            return __awaiter$c(this, void 0, void 0, function* () {
                try {
                    const { headers, method, body: functionArgs } = options;
                    let _headers = {};
                    let body;
                    if (functionArgs &&
                        ((headers && !Object.prototype.hasOwnProperty.call(headers, 'Content-Type')) || !headers)) {
                        if ((typeof Blob !== 'undefined' && functionArgs instanceof Blob) ||
                            functionArgs instanceof ArrayBuffer) {
                            // will work for File as File inherits Blob
                            // also works for ArrayBuffer as it is the same underlying structure as a Blob
                            _headers['Content-Type'] = 'application/octet-stream';
                            body = functionArgs;
                        }
                        else if (typeof functionArgs === 'string') {
                            // plain string
                            _headers['Content-Type'] = 'text/plain';
                            body = functionArgs;
                        }
                        else if (typeof FormData !== 'undefined' && functionArgs instanceof FormData) {
                            // don't set content-type headers
                            // Request will automatically add the right boundary value
                            body = functionArgs;
                        }
                        else {
                            // default, assume this is JSON
                            _headers['Content-Type'] = 'application/json';
                            body = JSON.stringify(functionArgs);
                        }
                    }
                    const response = yield this.fetch(`${this.url}/${functionName}`, {
                        method: method || 'POST',
                        // headers priority is (high to low):
                        // 1. invoke-level headers
                        // 2. client-level headers
                        // 3. default Content-Type header
                        headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
                        body,
                    }).catch((fetchError) => {
                        throw new FunctionsFetchError(fetchError);
                    });
                    const isRelayError = response.headers.get('x-relay-error');
                    if (isRelayError && isRelayError === 'true') {
                        throw new FunctionsRelayError(response);
                    }
                    if (!response.ok) {
                        throw new FunctionsHttpError(response);
                    }
                    let responseType = ((_a = response.headers.get('Content-Type')) !== null && _a !== void 0 ? _a : 'text/plain').split(';')[0].trim();
                    let data;
                    if (responseType === 'application/json') {
                        data = yield response.json();
                    }
                    else if (responseType === 'application/octet-stream') {
                        data = yield response.blob();
                    }
                    else if (responseType === 'multipart/form-data') {
                        data = yield response.formData();
                    }
                    else {
                        // default to text
                        data = yield response.text();
                    }
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var browserPonyfill$1 = {exports: {}};

    browserPonyfill$1.exports;

    (function (module, exports) {
    	var global = typeof self !== 'undefined' ? self : commonjsGlobal;
    	var __self__ = (function () {
    	function F() {
    	this.fetch = false;
    	this.DOMException = global.DOMException;
    	}
    	F.prototype = global;
    	return new F();
    	})();
    	(function(self) {

    	((function (exports) {

    	  var support = {
    	    searchParams: 'URLSearchParams' in self,
    	    iterable: 'Symbol' in self && 'iterator' in Symbol,
    	    blob:
    	      'FileReader' in self &&
    	      'Blob' in self &&
    	      (function() {
    	        try {
    	          new Blob();
    	          return true
    	        } catch (e) {
    	          return false
    	        }
    	      })(),
    	    formData: 'FormData' in self,
    	    arrayBuffer: 'ArrayBuffer' in self
    	  };

    	  function isDataView(obj) {
    	    return obj && DataView.prototype.isPrototypeOf(obj)
    	  }

    	  if (support.arrayBuffer) {
    	    var viewClasses = [
    	      '[object Int8Array]',
    	      '[object Uint8Array]',
    	      '[object Uint8ClampedArray]',
    	      '[object Int16Array]',
    	      '[object Uint16Array]',
    	      '[object Int32Array]',
    	      '[object Uint32Array]',
    	      '[object Float32Array]',
    	      '[object Float64Array]'
    	    ];

    	    var isArrayBufferView =
    	      ArrayBuffer.isView ||
    	      function(obj) {
    	        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    	      };
    	  }

    	  function normalizeName(name) {
    	    if (typeof name !== 'string') {
    	      name = String(name);
    	    }
    	    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
    	      throw new TypeError('Invalid character in header field name')
    	    }
    	    return name.toLowerCase()
    	  }

    	  function normalizeValue(value) {
    	    if (typeof value !== 'string') {
    	      value = String(value);
    	    }
    	    return value
    	  }

    	  // Build a destructive iterator for the value list
    	  function iteratorFor(items) {
    	    var iterator = {
    	      next: function() {
    	        var value = items.shift();
    	        return {done: value === undefined, value: value}
    	      }
    	    };

    	    if (support.iterable) {
    	      iterator[Symbol.iterator] = function() {
    	        return iterator
    	      };
    	    }

    	    return iterator
    	  }

    	  function Headers(headers) {
    	    this.map = {};

    	    if (headers instanceof Headers) {
    	      headers.forEach(function(value, name) {
    	        this.append(name, value);
    	      }, this);
    	    } else if (Array.isArray(headers)) {
    	      headers.forEach(function(header) {
    	        this.append(header[0], header[1]);
    	      }, this);
    	    } else if (headers) {
    	      Object.getOwnPropertyNames(headers).forEach(function(name) {
    	        this.append(name, headers[name]);
    	      }, this);
    	    }
    	  }

    	  Headers.prototype.append = function(name, value) {
    	    name = normalizeName(name);
    	    value = normalizeValue(value);
    	    var oldValue = this.map[name];
    	    this.map[name] = oldValue ? oldValue + ', ' + value : value;
    	  };

    	  Headers.prototype['delete'] = function(name) {
    	    delete this.map[normalizeName(name)];
    	  };

    	  Headers.prototype.get = function(name) {
    	    name = normalizeName(name);
    	    return this.has(name) ? this.map[name] : null
    	  };

    	  Headers.prototype.has = function(name) {
    	    return this.map.hasOwnProperty(normalizeName(name))
    	  };

    	  Headers.prototype.set = function(name, value) {
    	    this.map[normalizeName(name)] = normalizeValue(value);
    	  };

    	  Headers.prototype.forEach = function(callback, thisArg) {
    	    for (var name in this.map) {
    	      if (this.map.hasOwnProperty(name)) {
    	        callback.call(thisArg, this.map[name], name, this);
    	      }
    	    }
    	  };

    	  Headers.prototype.keys = function() {
    	    var items = [];
    	    this.forEach(function(value, name) {
    	      items.push(name);
    	    });
    	    return iteratorFor(items)
    	  };

    	  Headers.prototype.values = function() {
    	    var items = [];
    	    this.forEach(function(value) {
    	      items.push(value);
    	    });
    	    return iteratorFor(items)
    	  };

    	  Headers.prototype.entries = function() {
    	    var items = [];
    	    this.forEach(function(value, name) {
    	      items.push([name, value]);
    	    });
    	    return iteratorFor(items)
    	  };

    	  if (support.iterable) {
    	    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
    	  }

    	  function consumed(body) {
    	    if (body.bodyUsed) {
    	      return Promise.reject(new TypeError('Already read'))
    	    }
    	    body.bodyUsed = true;
    	  }

    	  function fileReaderReady(reader) {
    	    return new Promise(function(resolve, reject) {
    	      reader.onload = function() {
    	        resolve(reader.result);
    	      };
    	      reader.onerror = function() {
    	        reject(reader.error);
    	      };
    	    })
    	  }

    	  function readBlobAsArrayBuffer(blob) {
    	    var reader = new FileReader();
    	    var promise = fileReaderReady(reader);
    	    reader.readAsArrayBuffer(blob);
    	    return promise
    	  }

    	  function readBlobAsText(blob) {
    	    var reader = new FileReader();
    	    var promise = fileReaderReady(reader);
    	    reader.readAsText(blob);
    	    return promise
    	  }

    	  function readArrayBufferAsText(buf) {
    	    var view = new Uint8Array(buf);
    	    var chars = new Array(view.length);

    	    for (var i = 0; i < view.length; i++) {
    	      chars[i] = String.fromCharCode(view[i]);
    	    }
    	    return chars.join('')
    	  }

    	  function bufferClone(buf) {
    	    if (buf.slice) {
    	      return buf.slice(0)
    	    } else {
    	      var view = new Uint8Array(buf.byteLength);
    	      view.set(new Uint8Array(buf));
    	      return view.buffer
    	    }
    	  }

    	  function Body() {
    	    this.bodyUsed = false;

    	    this._initBody = function(body) {
    	      this._bodyInit = body;
    	      if (!body) {
    	        this._bodyText = '';
    	      } else if (typeof body === 'string') {
    	        this._bodyText = body;
    	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
    	        this._bodyBlob = body;
    	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
    	        this._bodyFormData = body;
    	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
    	        this._bodyText = body.toString();
    	      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
    	        this._bodyArrayBuffer = bufferClone(body.buffer);
    	        // IE 10-11 can't handle a DataView body.
    	        this._bodyInit = new Blob([this._bodyArrayBuffer]);
    	      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
    	        this._bodyArrayBuffer = bufferClone(body);
    	      } else {
    	        this._bodyText = body = Object.prototype.toString.call(body);
    	      }

    	      if (!this.headers.get('content-type')) {
    	        if (typeof body === 'string') {
    	          this.headers.set('content-type', 'text/plain;charset=UTF-8');
    	        } else if (this._bodyBlob && this._bodyBlob.type) {
    	          this.headers.set('content-type', this._bodyBlob.type);
    	        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
    	          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    	        }
    	      }
    	    };

    	    if (support.blob) {
    	      this.blob = function() {
    	        var rejected = consumed(this);
    	        if (rejected) {
    	          return rejected
    	        }

    	        if (this._bodyBlob) {
    	          return Promise.resolve(this._bodyBlob)
    	        } else if (this._bodyArrayBuffer) {
    	          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
    	        } else if (this._bodyFormData) {
    	          throw new Error('could not read FormData body as blob')
    	        } else {
    	          return Promise.resolve(new Blob([this._bodyText]))
    	        }
    	      };

    	      this.arrayBuffer = function() {
    	        if (this._bodyArrayBuffer) {
    	          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
    	        } else {
    	          return this.blob().then(readBlobAsArrayBuffer)
    	        }
    	      };
    	    }

    	    this.text = function() {
    	      var rejected = consumed(this);
    	      if (rejected) {
    	        return rejected
    	      }

    	      if (this._bodyBlob) {
    	        return readBlobAsText(this._bodyBlob)
    	      } else if (this._bodyArrayBuffer) {
    	        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
    	      } else if (this._bodyFormData) {
    	        throw new Error('could not read FormData body as text')
    	      } else {
    	        return Promise.resolve(this._bodyText)
    	      }
    	    };

    	    if (support.formData) {
    	      this.formData = function() {
    	        return this.text().then(decode)
    	      };
    	    }

    	    this.json = function() {
    	      return this.text().then(JSON.parse)
    	    };

    	    return this
    	  }

    	  // HTTP methods whose capitalization should be normalized
    	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

    	  function normalizeMethod(method) {
    	    var upcased = method.toUpperCase();
    	    return methods.indexOf(upcased) > -1 ? upcased : method
    	  }

    	  function Request(input, options) {
    	    options = options || {};
    	    var body = options.body;

    	    if (input instanceof Request) {
    	      if (input.bodyUsed) {
    	        throw new TypeError('Already read')
    	      }
    	      this.url = input.url;
    	      this.credentials = input.credentials;
    	      if (!options.headers) {
    	        this.headers = new Headers(input.headers);
    	      }
    	      this.method = input.method;
    	      this.mode = input.mode;
    	      this.signal = input.signal;
    	      if (!body && input._bodyInit != null) {
    	        body = input._bodyInit;
    	        input.bodyUsed = true;
    	      }
    	    } else {
    	      this.url = String(input);
    	    }

    	    this.credentials = options.credentials || this.credentials || 'same-origin';
    	    if (options.headers || !this.headers) {
    	      this.headers = new Headers(options.headers);
    	    }
    	    this.method = normalizeMethod(options.method || this.method || 'GET');
    	    this.mode = options.mode || this.mode || null;
    	    this.signal = options.signal || this.signal;
    	    this.referrer = null;

    	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
    	      throw new TypeError('Body not allowed for GET or HEAD requests')
    	    }
    	    this._initBody(body);
    	  }

    	  Request.prototype.clone = function() {
    	    return new Request(this, {body: this._bodyInit})
    	  };

    	  function decode(body) {
    	    var form = new FormData();
    	    body
    	      .trim()
    	      .split('&')
    	      .forEach(function(bytes) {
    	        if (bytes) {
    	          var split = bytes.split('=');
    	          var name = split.shift().replace(/\+/g, ' ');
    	          var value = split.join('=').replace(/\+/g, ' ');
    	          form.append(decodeURIComponent(name), decodeURIComponent(value));
    	        }
    	      });
    	    return form
    	  }

    	  function parseHeaders(rawHeaders) {
    	    var headers = new Headers();
    	    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    	    // https://tools.ietf.org/html/rfc7230#section-3.2
    	    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    	    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
    	      var parts = line.split(':');
    	      var key = parts.shift().trim();
    	      if (key) {
    	        var value = parts.join(':').trim();
    	        headers.append(key, value);
    	      }
    	    });
    	    return headers
    	  }

    	  Body.call(Request.prototype);

    	  function Response(bodyInit, options) {
    	    if (!options) {
    	      options = {};
    	    }

    	    this.type = 'default';
    	    this.status = options.status === undefined ? 200 : options.status;
    	    this.ok = this.status >= 200 && this.status < 300;
    	    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    	    this.headers = new Headers(options.headers);
    	    this.url = options.url || '';
    	    this._initBody(bodyInit);
    	  }

    	  Body.call(Response.prototype);

    	  Response.prototype.clone = function() {
    	    return new Response(this._bodyInit, {
    	      status: this.status,
    	      statusText: this.statusText,
    	      headers: new Headers(this.headers),
    	      url: this.url
    	    })
    	  };

    	  Response.error = function() {
    	    var response = new Response(null, {status: 0, statusText: ''});
    	    response.type = 'error';
    	    return response
    	  };

    	  var redirectStatuses = [301, 302, 303, 307, 308];

    	  Response.redirect = function(url, status) {
    	    if (redirectStatuses.indexOf(status) === -1) {
    	      throw new RangeError('Invalid status code')
    	    }

    	    return new Response(null, {status: status, headers: {location: url}})
    	  };

    	  exports.DOMException = self.DOMException;
    	  try {
    	    new exports.DOMException();
    	  } catch (err) {
    	    exports.DOMException = function(message, name) {
    	      this.message = message;
    	      this.name = name;
    	      var error = Error(message);
    	      this.stack = error.stack;
    	    };
    	    exports.DOMException.prototype = Object.create(Error.prototype);
    	    exports.DOMException.prototype.constructor = exports.DOMException;
    	  }

    	  function fetch(input, init) {
    	    return new Promise(function(resolve, reject) {
    	      var request = new Request(input, init);

    	      if (request.signal && request.signal.aborted) {
    	        return reject(new exports.DOMException('Aborted', 'AbortError'))
    	      }

    	      var xhr = new XMLHttpRequest();

    	      function abortXhr() {
    	        xhr.abort();
    	      }

    	      xhr.onload = function() {
    	        var options = {
    	          status: xhr.status,
    	          statusText: xhr.statusText,
    	          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
    	        };
    	        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
    	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
    	        resolve(new Response(body, options));
    	      };

    	      xhr.onerror = function() {
    	        reject(new TypeError('Network request failed'));
    	      };

    	      xhr.ontimeout = function() {
    	        reject(new TypeError('Network request failed'));
    	      };

    	      xhr.onabort = function() {
    	        reject(new exports.DOMException('Aborted', 'AbortError'));
    	      };

    	      xhr.open(request.method, request.url, true);

    	      if (request.credentials === 'include') {
    	        xhr.withCredentials = true;
    	      } else if (request.credentials === 'omit') {
    	        xhr.withCredentials = false;
    	      }

    	      if ('responseType' in xhr && support.blob) {
    	        xhr.responseType = 'blob';
    	      }

    	      request.headers.forEach(function(value, name) {
    	        xhr.setRequestHeader(name, value);
    	      });

    	      if (request.signal) {
    	        request.signal.addEventListener('abort', abortXhr);

    	        xhr.onreadystatechange = function() {
    	          // DONE (success or failure)
    	          if (xhr.readyState === 4) {
    	            request.signal.removeEventListener('abort', abortXhr);
    	          }
    	        };
    	      }

    	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    	    })
    	  }

    	  fetch.polyfill = true;

    	  if (!self.fetch) {
    	    self.fetch = fetch;
    	    self.Headers = Headers;
    	    self.Request = Request;
    	    self.Response = Response;
    	  }

    	  exports.Headers = Headers;
    	  exports.Request = Request;
    	  exports.Response = Response;
    	  exports.fetch = fetch;

    	  Object.defineProperty(exports, '__esModule', { value: true });

    	  return exports;

    	}))({});
    	})(__self__);
    	__self__.fetch.ponyfill = true;
    	// Remove "polyfill" property added by whatwg-fetch
    	delete __self__.fetch.polyfill;
    	// Choose between native implementation (global) or custom implementation (__self__)
    	// var ctx = global.fetch ? global : __self__;
    	var ctx = __self__; // this line disable service worker support temporarily
    	exports = ctx.fetch; // To enable: import fetch from 'cross-fetch'
    	exports.default = ctx.fetch; // For TypeScript consumers without esModuleInterop.
    	exports.fetch = ctx.fetch; // To enable: import {fetch} from 'cross-fetch'
    	exports.Headers = ctx.Headers;
    	exports.Request = ctx.Request;
    	exports.Response = ctx.Response;
    	module.exports = exports; 
    } (browserPonyfill$1, browserPonyfill$1.exports));

    var browserPonyfillExports = browserPonyfill$1.exports;
    var crossFetch = /*@__PURE__*/getDefaultExportFromCjs(browserPonyfillExports);

    var browserPonyfill = /*#__PURE__*/_mergeNamespaces({
        __proto__: null,
        'default': crossFetch
    }, [browserPonyfillExports]);

    class PostgrestBuilder {
        constructor(builder) {
            this.shouldThrowOnError = false;
            this.method = builder.method;
            this.url = builder.url;
            this.headers = builder.headers;
            this.schema = builder.schema;
            this.body = builder.body;
            this.shouldThrowOnError = builder.shouldThrowOnError;
            this.signal = builder.signal;
            this.isMaybeSingle = builder.isMaybeSingle;
            if (builder.fetch) {
                this.fetch = builder.fetch;
            }
            else if (typeof fetch === 'undefined') {
                this.fetch = crossFetch;
            }
            else {
                this.fetch = fetch;
            }
        }
        /**
         * If there's an error with the query, throwOnError will reject the promise by
         * throwing the error instead of returning it as part of a successful response.
         *
         * {@link https://github.com/supabase/supabase-js/issues/92}
         */
        throwOnError() {
            this.shouldThrowOnError = true;
            return this;
        }
        then(onfulfilled, onrejected) {
            // https://postgrest.org/en/stable/api.html#switching-schemas
            if (this.schema === undefined) ;
            else if (['GET', 'HEAD'].includes(this.method)) {
                this.headers['Accept-Profile'] = this.schema;
            }
            else {
                this.headers['Content-Profile'] = this.schema;
            }
            if (this.method !== 'GET' && this.method !== 'HEAD') {
                this.headers['Content-Type'] = 'application/json';
            }
            // NOTE: Invoke w/o `this` to avoid illegal invocation error.
            // https://github.com/supabase/postgrest-js/pull/247
            const _fetch = this.fetch;
            let res = _fetch(this.url.toString(), {
                method: this.method,
                headers: this.headers,
                body: JSON.stringify(this.body),
                signal: this.signal,
            }).then(async (res) => {
                var _a, _b, _c;
                let error = null;
                let data = null;
                let count = null;
                let status = res.status;
                let statusText = res.statusText;
                if (res.ok) {
                    if (this.method !== 'HEAD') {
                        const body = await res.text();
                        if (body === '') ;
                        else if (this.headers['Accept'] === 'text/csv') {
                            data = body;
                        }
                        else if (this.headers['Accept'] &&
                            this.headers['Accept'].includes('application/vnd.pgrst.plan+text')) {
                            data = body;
                        }
                        else {
                            data = JSON.parse(body);
                        }
                    }
                    const countHeader = (_a = this.headers['Prefer']) === null || _a === void 0 ? void 0 : _a.match(/count=(exact|planned|estimated)/);
                    const contentRange = (_b = res.headers.get('content-range')) === null || _b === void 0 ? void 0 : _b.split('/');
                    if (countHeader && contentRange && contentRange.length > 1) {
                        count = parseInt(contentRange[1]);
                    }
                    // Temporary partial fix for https://github.com/supabase/postgrest-js/issues/361
                    // Issue persists e.g. for `.insert([...]).select().maybeSingle()`
                    if (this.isMaybeSingle && this.method === 'GET' && Array.isArray(data)) {
                        if (data.length > 1) {
                            error = {
                                // https://github.com/PostgREST/postgrest/blob/a867d79c42419af16c18c3fb019eba8df992626f/src/PostgREST/Error.hs#L553
                                code: 'PGRST116',
                                details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
                                hint: null,
                                message: 'JSON object requested, multiple (or no) rows returned',
                            };
                            data = null;
                            count = null;
                            status = 406;
                            statusText = 'Not Acceptable';
                        }
                        else if (data.length === 1) {
                            data = data[0];
                        }
                        else {
                            data = null;
                        }
                    }
                }
                else {
                    const body = await res.text();
                    try {
                        error = JSON.parse(body);
                        // Workaround for https://github.com/supabase/postgrest-js/issues/295
                        if (Array.isArray(error) && res.status === 404) {
                            data = [];
                            error = null;
                            status = 200;
                            statusText = 'OK';
                        }
                    }
                    catch (_d) {
                        // Workaround for https://github.com/supabase/postgrest-js/issues/295
                        if (res.status === 404 && body === '') {
                            status = 204;
                            statusText = 'No Content';
                        }
                        else {
                            error = {
                                message: body,
                            };
                        }
                    }
                    if (error && this.isMaybeSingle && ((_c = error === null || error === void 0 ? void 0 : error.details) === null || _c === void 0 ? void 0 : _c.includes('Results contain 0 rows'))) {
                        error = null;
                        status = 200;
                        statusText = 'OK';
                    }
                    if (error && this.shouldThrowOnError) {
                        throw error;
                    }
                }
                const postgrestResponse = {
                    error,
                    data,
                    count,
                    status,
                    statusText,
                };
                return postgrestResponse;
            });
            if (!this.shouldThrowOnError) {
                res = res.catch((fetchError) => {
                    var _a, _b, _c;
                    return ({
                        error: {
                            message: `${(_a = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _a !== void 0 ? _a : 'FetchError'}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
                            details: `${(_b = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _b !== void 0 ? _b : ''}`,
                            hint: '',
                            code: `${(_c = fetchError === null || fetchError === void 0 ? void 0 : fetchError.code) !== null && _c !== void 0 ? _c : ''}`,
                        },
                        data: null,
                        count: null,
                        status: 0,
                        statusText: '',
                    });
                });
            }
            return res.then(onfulfilled, onrejected);
        }
    }

    class PostgrestTransformBuilder extends PostgrestBuilder {
        /**
         * Perform a SELECT on the query result.
         *
         * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
         * return modified rows. By calling this method, modified rows are returned in
         * `data`.
         *
         * @param columns - The columns to retrieve, separated by commas
         */
        select(columns) {
            // Remove whitespaces except when quoted
            let quoted = false;
            const cleanedColumns = (columns !== null && columns !== void 0 ? columns : '*')
                .split('')
                .map((c) => {
                if (/\s/.test(c) && !quoted) {
                    return '';
                }
                if (c === '"') {
                    quoted = !quoted;
                }
                return c;
            })
                .join('');
            this.url.searchParams.set('select', cleanedColumns);
            if (this.headers['Prefer']) {
                this.headers['Prefer'] += ',';
            }
            this.headers['Prefer'] += 'return=representation';
            return this;
        }
        /**
         * Order the query result by `column`.
         *
         * You can call this method multiple times to order by multiple columns.
         *
         * You can order foreign tables, but it doesn't affect the ordering of the
         * current table.
         *
         * @param column - The column to order by
         * @param options - Named parameters
         * @param options.ascending - If `true`, the result will be in ascending order
         * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
         * `null`s appear last.
         * @param options.foreignTable - Set this to order a foreign table by foreign
         * columns
         */
        order(column, { ascending = true, nullsFirst, foreignTable, } = {}) {
            const key = foreignTable ? `${foreignTable}.order` : 'order';
            const existingOrder = this.url.searchParams.get(key);
            this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ''}${column}.${ascending ? 'asc' : 'desc'}${nullsFirst === undefined ? '' : nullsFirst ? '.nullsfirst' : '.nullslast'}`);
            return this;
        }
        /**
         * Limit the query result by `count`.
         *
         * @param count - The maximum number of rows to return
         * @param options - Named parameters
         * @param options.foreignTable - Set this to limit rows of foreign tables
         * instead of the current table
         */
        limit(count, { foreignTable } = {}) {
            const key = typeof foreignTable === 'undefined' ? 'limit' : `${foreignTable}.limit`;
            this.url.searchParams.set(key, `${count}`);
            return this;
        }
        /**
         * Limit the query result by `from` and `to` inclusively.
         *
         * @param from - The starting index from which to limit the result
         * @param to - The last index to which to limit the result
         * @param options - Named parameters
         * @param options.foreignTable - Set this to limit rows of foreign tables
         * instead of the current table
         */
        range(from, to, { foreignTable } = {}) {
            const keyOffset = typeof foreignTable === 'undefined' ? 'offset' : `${foreignTable}.offset`;
            const keyLimit = typeof foreignTable === 'undefined' ? 'limit' : `${foreignTable}.limit`;
            this.url.searchParams.set(keyOffset, `${from}`);
            // Range is inclusive, so add 1
            this.url.searchParams.set(keyLimit, `${to - from + 1}`);
            return this;
        }
        /**
         * Set the AbortSignal for the fetch request.
         *
         * @param signal - The AbortSignal to use for the fetch request
         */
        abortSignal(signal) {
            this.signal = signal;
            return this;
        }
        /**
         * Return `data` as a single object instead of an array of objects.
         *
         * Query result must be one row (e.g. using `.limit(1)`), otherwise this
         * returns an error.
         */
        single() {
            this.headers['Accept'] = 'application/vnd.pgrst.object+json';
            return this;
        }
        /**
         * Return `data` as a single object instead of an array of objects.
         *
         * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
         * this returns an error.
         */
        maybeSingle() {
            // Temporary partial fix for https://github.com/supabase/postgrest-js/issues/361
            // Issue persists e.g. for `.insert([...]).select().maybeSingle()`
            if (this.method === 'GET') {
                this.headers['Accept'] = 'application/json';
            }
            else {
                this.headers['Accept'] = 'application/vnd.pgrst.object+json';
            }
            this.isMaybeSingle = true;
            return this;
        }
        /**
         * Return `data` as a string in CSV format.
         */
        csv() {
            this.headers['Accept'] = 'text/csv';
            return this;
        }
        /**
         * Return `data` as an object in [GeoJSON](https://geojson.org) format.
         */
        geojson() {
            this.headers['Accept'] = 'application/geo+json';
            return this;
        }
        /**
         * Return `data` as the EXPLAIN plan for the query.
         *
         * @param options - Named parameters
         *
         * @param options.analyze - If `true`, the query will be executed and the
         * actual run time will be returned
         *
         * @param options.verbose - If `true`, the query identifier will be returned
         * and `data` will include the output columns of the query
         *
         * @param options.settings - If `true`, include information on configuration
         * parameters that affect query planning
         *
         * @param options.buffers - If `true`, include information on buffer usage
         *
         * @param options.wal - If `true`, include information on WAL record generation
         *
         * @param options.format - The format of the output, can be `"text"` (default)
         * or `"json"`
         */
        explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = 'text', } = {}) {
            const options = [
                analyze ? 'analyze' : null,
                verbose ? 'verbose' : null,
                settings ? 'settings' : null,
                buffers ? 'buffers' : null,
                wal ? 'wal' : null,
            ]
                .filter(Boolean)
                .join('|');
            // An Accept header can carry multiple media types but postgrest-js always sends one
            const forMediatype = this.headers['Accept'];
            this.headers['Accept'] = `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`;
            if (format === 'json')
                return this;
            else
                return this;
        }
        /**
         * Rollback the query.
         *
         * `data` will still be returned, but the query is not committed.
         */
        rollback() {
            var _a;
            if (((_a = this.headers['Prefer']) !== null && _a !== void 0 ? _a : '').trim().length > 0) {
                this.headers['Prefer'] += ',tx=rollback';
            }
            else {
                this.headers['Prefer'] = 'tx=rollback';
            }
            return this;
        }
        /**
         * Override the type of the returned `data`.
         *
         * @typeParam NewResult - The new result type to override with
         */
        returns() {
            return this;
        }
    }

    class PostgrestFilterBuilder extends PostgrestTransformBuilder {
        /**
         * Match only rows where `column` is equal to `value`.
         *
         * To check if the value of `column` is NULL, you should use `.is()` instead.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        eq(column, value) {
            this.url.searchParams.append(column, `eq.${value}`);
            return this;
        }
        /**
         * Match only rows where `column` is not equal to `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        neq(column, value) {
            this.url.searchParams.append(column, `neq.${value}`);
            return this;
        }
        /**
         * Match only rows where `column` is greater than `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        gt(column, value) {
            this.url.searchParams.append(column, `gt.${value}`);
            return this;
        }
        /**
         * Match only rows where `column` is greater than or equal to `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        gte(column, value) {
            this.url.searchParams.append(column, `gte.${value}`);
            return this;
        }
        /**
         * Match only rows where `column` is less than `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        lt(column, value) {
            this.url.searchParams.append(column, `lt.${value}`);
            return this;
        }
        /**
         * Match only rows where `column` is less than or equal to `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        lte(column, value) {
            this.url.searchParams.append(column, `lte.${value}`);
            return this;
        }
        /**
         * Match only rows where `column` matches `pattern` case-sensitively.
         *
         * @param column - The column to filter on
         * @param pattern - The pattern to match with
         */
        like(column, pattern) {
            this.url.searchParams.append(column, `like.${pattern}`);
            return this;
        }
        /**
         * Match only rows where `column` matches all of `patterns` case-sensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        likeAllOf(column, patterns) {
            this.url.searchParams.append(column, `like(all).{${patterns.join(',')}}`);
            return this;
        }
        /**
         * Match only rows where `column` matches any of `patterns` case-sensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        likeAnyOf(column, patterns) {
            this.url.searchParams.append(column, `like(any).{${patterns.join(',')}}`);
            return this;
        }
        /**
         * Match only rows where `column` matches `pattern` case-insensitively.
         *
         * @param column - The column to filter on
         * @param pattern - The pattern to match with
         */
        ilike(column, pattern) {
            this.url.searchParams.append(column, `ilike.${pattern}`);
            return this;
        }
        /**
         * Match only rows where `column` matches all of `patterns` case-insensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        ilikeAllOf(column, patterns) {
            this.url.searchParams.append(column, `ilike(all).{${patterns.join(',')}}`);
            return this;
        }
        /**
         * Match only rows where `column` matches any of `patterns` case-insensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        ilikeAnyOf(column, patterns) {
            this.url.searchParams.append(column, `ilike(any).{${patterns.join(',')}}`);
            return this;
        }
        /**
         * Match only rows where `column` IS `value`.
         *
         * For non-boolean columns, this is only relevant for checking if the value of
         * `column` is NULL by setting `value` to `null`.
         *
         * For boolean columns, you can also set `value` to `true` or `false` and it
         * will behave the same way as `.eq()`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        is(column, value) {
            this.url.searchParams.append(column, `is.${value}`);
            return this;
        }
        /**
         * Match only rows where `column` is included in the `values` array.
         *
         * @param column - The column to filter on
         * @param values - The values array to filter with
         */
        in(column, values) {
            const cleanedValues = values
                .map((s) => {
                // handle postgrest reserved characters
                // https://postgrest.org/en/v7.0.0/api.html#reserved-characters
                if (typeof s === 'string' && new RegExp('[,()]').test(s))
                    return `"${s}"`;
                else
                    return `${s}`;
            })
                .join(',');
            this.url.searchParams.append(column, `in.(${cleanedValues})`);
            return this;
        }
        /**
         * Only relevant for jsonb, array, and range columns. Match only rows where
         * `column` contains every element appearing in `value`.
         *
         * @param column - The jsonb, array, or range column to filter on
         * @param value - The jsonb, array, or range value to filter with
         */
        contains(column, value) {
            if (typeof value === 'string') {
                // range types can be inclusive '[', ']' or exclusive '(', ')' so just
                // keep it simple and accept a string
                this.url.searchParams.append(column, `cs.${value}`);
            }
            else if (Array.isArray(value)) {
                // array
                this.url.searchParams.append(column, `cs.{${value.join(',')}}`);
            }
            else {
                // json
                this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
            }
            return this;
        }
        /**
         * Only relevant for jsonb, array, and range columns. Match only rows where
         * every element appearing in `column` is contained by `value`.
         *
         * @param column - The jsonb, array, or range column to filter on
         * @param value - The jsonb, array, or range value to filter with
         */
        containedBy(column, value) {
            if (typeof value === 'string') {
                // range
                this.url.searchParams.append(column, `cd.${value}`);
            }
            else if (Array.isArray(value)) {
                // array
                this.url.searchParams.append(column, `cd.{${value.join(',')}}`);
            }
            else {
                // json
                this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
            }
            return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is greater than any element in `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeGt(column, range) {
            this.url.searchParams.append(column, `sr.${range}`);
            return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is either contained in `range` or greater than any element in
         * `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeGte(column, range) {
            this.url.searchParams.append(column, `nxl.${range}`);
            return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is less than any element in `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeLt(column, range) {
            this.url.searchParams.append(column, `sl.${range}`);
            return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is either contained in `range` or less than any element in
         * `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeLte(column, range) {
            this.url.searchParams.append(column, `nxr.${range}`);
            return this;
        }
        /**
         * Only relevant for range columns. Match only rows where `column` is
         * mutually exclusive to `range` and there can be no element between the two
         * ranges.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeAdjacent(column, range) {
            this.url.searchParams.append(column, `adj.${range}`);
            return this;
        }
        /**
         * Only relevant for array and range columns. Match only rows where
         * `column` and `value` have an element in common.
         *
         * @param column - The array or range column to filter on
         * @param value - The array or range value to filter with
         */
        overlaps(column, value) {
            if (typeof value === 'string') {
                // range
                this.url.searchParams.append(column, `ov.${value}`);
            }
            else {
                // array
                this.url.searchParams.append(column, `ov.{${value.join(',')}}`);
            }
            return this;
        }
        /**
         * Only relevant for text and tsvector columns. Match only rows where
         * `column` matches the query string in `query`.
         *
         * @param column - The text or tsvector column to filter on
         * @param query - The query text to match with
         * @param options - Named parameters
         * @param options.config - The text search configuration to use
         * @param options.type - Change how the `query` text is interpreted
         */
        textSearch(column, query, { config, type } = {}) {
            let typePart = '';
            if (type === 'plain') {
                typePart = 'pl';
            }
            else if (type === 'phrase') {
                typePart = 'ph';
            }
            else if (type === 'websearch') {
                typePart = 'w';
            }
            const configPart = config === undefined ? '' : `(${config})`;
            this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
            return this;
        }
        /**
         * Match only rows where each column in `query` keys is equal to its
         * associated value. Shorthand for multiple `.eq()`s.
         *
         * @param query - The object to filter with, with column names as keys mapped
         * to their filter values
         */
        match(query) {
            Object.entries(query).forEach(([column, value]) => {
                this.url.searchParams.append(column, `eq.${value}`);
            });
            return this;
        }
        /**
         * Match only rows which doesn't satisfy the filter.
         *
         * Unlike most filters, `opearator` and `value` are used as-is and need to
         * follow [PostgREST
         * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
         * to make sure they are properly sanitized.
         *
         * @param column - The column to filter on
         * @param operator - The operator to be negated to filter with, following
         * PostgREST syntax
         * @param value - The value to filter with, following PostgREST syntax
         */
        not(column, operator, value) {
            this.url.searchParams.append(column, `not.${operator}.${value}`);
            return this;
        }
        /**
         * Match only rows which satisfy at least one of the filters.
         *
         * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
         * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
         * to make sure it's properly sanitized.
         *
         * It's currently not possible to do an `.or()` filter across multiple tables.
         *
         * @param filters - The filters to use, following PostgREST syntax
         * @param foreignTable - Set this to filter on foreign tables instead of the
         * current table
         */
        or(filters, { foreignTable } = {}) {
            const key = foreignTable ? `${foreignTable}.or` : 'or';
            this.url.searchParams.append(key, `(${filters})`);
            return this;
        }
        /**
         * Match only rows which satisfy the filter. This is an escape hatch - you
         * should use the specific filter methods wherever possible.
         *
         * Unlike most filters, `opearator` and `value` are used as-is and need to
         * follow [PostgREST
         * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
         * to make sure they are properly sanitized.
         *
         * @param column - The column to filter on
         * @param operator - The operator to filter with, following PostgREST syntax
         * @param value - The value to filter with, following PostgREST syntax
         */
        filter(column, operator, value) {
            this.url.searchParams.append(column, `${operator}.${value}`);
            return this;
        }
    }

    class PostgrestQueryBuilder {
        constructor(url, { headers = {}, schema, fetch, }) {
            this.url = url;
            this.headers = headers;
            this.schema = schema;
            this.fetch = fetch;
        }
        /**
         * Perform a SELECT query on the table or view.
         *
         * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
         *
         * @param options - Named parameters
         *
         * @param options.head - When set to `true`, `data` will not be returned.
         * Useful if you only need the count.
         *
         * @param options.count - Count algorithm to use to count rows in the table or view.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        select(columns, { head = false, count, } = {}) {
            const method = head ? 'HEAD' : 'GET';
            // Remove whitespaces except when quoted
            let quoted = false;
            const cleanedColumns = (columns !== null && columns !== void 0 ? columns : '*')
                .split('')
                .map((c) => {
                if (/\s/.test(c) && !quoted) {
                    return '';
                }
                if (c === '"') {
                    quoted = !quoted;
                }
                return c;
            })
                .join('');
            this.url.searchParams.set('select', cleanedColumns);
            if (count) {
                this.headers['Prefer'] = `count=${count}`;
            }
            return new PostgrestFilterBuilder({
                method,
                url: this.url,
                headers: this.headers,
                schema: this.schema,
                fetch: this.fetch,
                allowEmpty: false,
            });
        }
        /**
         * Perform an INSERT into the table or view.
         *
         * By default, inserted rows are not returned. To return it, chain the call
         * with `.select()`.
         *
         * @param values - The values to insert. Pass an object to insert a single row
         * or an array to insert multiple rows.
         *
         * @param options - Named parameters
         *
         * @param options.count - Count algorithm to use to count inserted rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         *
         * @param options.defaultToNull - Make missing fields default to `null`.
         * Otherwise, use the default value for the column.
         */
        insert(values, { count, defaultToNull = true, } = {}) {
            const method = 'POST';
            const prefersHeaders = [];
            if (this.headers['Prefer']) {
                prefersHeaders.push(this.headers['Prefer']);
            }
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            if (!defaultToNull) {
                prefersHeaders.push('missing=default');
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            if (Array.isArray(values)) {
                const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
                if (columns.length > 0) {
                    const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
                    this.url.searchParams.set('columns', uniqueColumns.join(','));
                }
            }
            return new PostgrestFilterBuilder({
                method,
                url: this.url,
                headers: this.headers,
                schema: this.schema,
                body: values,
                fetch: this.fetch,
                allowEmpty: false,
            });
        }
        /**
         * Perform an UPSERT on the table or view. Depending on the column(s) passed
         * to `onConflict`, `.upsert()` allows you to perform the equivalent of
         * `.insert()` if a row with the corresponding `onConflict` columns doesn't
         * exist, or if it does exist, perform an alternative action depending on
         * `ignoreDuplicates`.
         *
         * By default, upserted rows are not returned. To return it, chain the call
         * with `.select()`.
         *
         * @param values - The values to upsert with. Pass an object to upsert a
         * single row or an array to upsert multiple rows.
         *
         * @param options - Named parameters
         *
         * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
         * duplicate rows are determined. Two rows are duplicates if all the
         * `onConflict` columns are equal.
         *
         * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
         * `false`, duplicate rows are merged with existing rows.
         *
         * @param options.count - Count algorithm to use to count upserted rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         *
         * @param options.defaultToNull - Make missing fields default to `null`.
         * Otherwise, use the default value for the column. This only applies when
         * inserting new rows, not when merging with existing rows under
         * `ignoreDuplicates: false`.
         */
        upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true, } = {}) {
            const method = 'POST';
            const prefersHeaders = [`resolution=${ignoreDuplicates ? 'ignore' : 'merge'}-duplicates`];
            if (onConflict !== undefined)
                this.url.searchParams.set('on_conflict', onConflict);
            if (this.headers['Prefer']) {
                prefersHeaders.push(this.headers['Prefer']);
            }
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            if (!defaultToNull) {
                prefersHeaders.push('missing=default');
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            if (Array.isArray(values)) {
                const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
                if (columns.length > 0) {
                    const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
                    this.url.searchParams.set('columns', uniqueColumns.join(','));
                }
            }
            return new PostgrestFilterBuilder({
                method,
                url: this.url,
                headers: this.headers,
                schema: this.schema,
                body: values,
                fetch: this.fetch,
                allowEmpty: false,
            });
        }
        /**
         * Perform an UPDATE on the table or view.
         *
         * By default, updated rows are not returned. To return it, chain the call
         * with `.select()` after filters.
         *
         * @param values - The values to update with
         *
         * @param options - Named parameters
         *
         * @param options.count - Count algorithm to use to count updated rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        update(values, { count, } = {}) {
            const method = 'PATCH';
            const prefersHeaders = [];
            if (this.headers['Prefer']) {
                prefersHeaders.push(this.headers['Prefer']);
            }
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            return new PostgrestFilterBuilder({
                method,
                url: this.url,
                headers: this.headers,
                schema: this.schema,
                body: values,
                fetch: this.fetch,
                allowEmpty: false,
            });
        }
        /**
         * Perform a DELETE on the table or view.
         *
         * By default, deleted rows are not returned. To return it, chain the call
         * with `.select()` after filters.
         *
         * @param options - Named parameters
         *
         * @param options.count - Count algorithm to use to count deleted rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        delete({ count, } = {}) {
            const method = 'DELETE';
            const prefersHeaders = [];
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            if (this.headers['Prefer']) {
                prefersHeaders.unshift(this.headers['Prefer']);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            return new PostgrestFilterBuilder({
                method,
                url: this.url,
                headers: this.headers,
                schema: this.schema,
                fetch: this.fetch,
                allowEmpty: false,
            });
        }
    }

    const version$6 = '1.7.1';

    const DEFAULT_HEADERS$4 = { 'X-Client-Info': `postgrest-js/${version$6}` };

    /**
     * PostgREST client.
     *
     * @typeParam Database - Types for the schema from the [type
     * generator](https://supabase.com/docs/reference/javascript/next/typescript-support)
     *
     * @typeParam SchemaName - Postgres schema to switch to. Must be a string
     * literal, the same one passed to the constructor. If the schema is not
     * `"public"`, this must be supplied manually.
     */
    class PostgrestClient {
        // TODO: Add back shouldThrowOnError once we figure out the typings
        /**
         * Creates a PostgREST client.
         *
         * @param url - URL of the PostgREST endpoint
         * @param options - Named parameters
         * @param options.headers - Custom headers
         * @param options.schema - Postgres schema to switch to
         * @param options.fetch - Custom fetch
         */
        constructor(url, { headers = {}, schema, fetch, } = {}) {
            this.url = url;
            this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$4), headers);
            this.schema = schema;
            this.fetch = fetch;
        }
        /**
         * Perform a query on a table or a view.
         *
         * @param relation - The table or view name to query
         */
        from(relation) {
            const url = new URL(`${this.url}/${relation}`);
            return new PostgrestQueryBuilder(url, {
                headers: Object.assign({}, this.headers),
                schema: this.schema,
                fetch: this.fetch,
            });
        }
        /**
         * Perform a function call.
         *
         * @param fn - The function name to call
         * @param args - The arguments to pass to the function call
         * @param options - Named parameters
         * @param options.head - When set to `true`, `data` will not be returned.
         * Useful if you only need the count.
         * @param options.count - Count algorithm to use to count rows returned by the
         * function. Only applicable for [set-returning
         * functions](https://www.postgresql.org/docs/current/functions-srf.html).
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        rpc(fn, args = {}, { head = false, count, } = {}) {
            let method;
            const url = new URL(`${this.url}/rpc/${fn}`);
            let body;
            if (head) {
                method = 'HEAD';
                Object.entries(args).forEach(([name, value]) => {
                    url.searchParams.append(name, `${value}`);
                });
            }
            else {
                method = 'POST';
                body = args;
            }
            const headers = Object.assign({}, this.headers);
            if (count) {
                headers['Prefer'] = `count=${count}`;
            }
            return new PostgrestFilterBuilder({
                method,
                url,
                headers,
                schema: this.schema,
                body,
                fetch: this.fetch,
                allowEmpty: false,
            });
        }
    }

    var global$1;
    var hasRequiredGlobal;

    function requireGlobal () {
    	if (hasRequiredGlobal) return global$1;
    	hasRequiredGlobal = 1;
    	var naiveFallback = function () {
    		if (typeof self === "object" && self) return self;
    		if (typeof window === "object" && window) return window;
    		throw new Error("Unable to resolve global `this`");
    	};

    	global$1 = (function () {
    		if (this) return this;

    		// Unexpected strict mode (may happen if e.g. bundled into ESM module)

    		// Fallback to standard globalThis if available
    		if (typeof globalThis === "object" && globalThis) return globalThis;

    		// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
    		// In all ES5+ engines global object inherits from Object.prototype
    		// (if you approached one that doesn't please report)
    		try {
    			Object.defineProperty(Object.prototype, "__global__", {
    				get: function () { return this; },
    				configurable: true
    			});
    		} catch (error) {
    			// Unfortunate case of updates to Object.prototype being restricted
    			// via preventExtensions, seal or freeze
    			return naiveFallback();
    		}
    		try {
    			// Safari case (window.__global__ works, but __global__ does not)
    			if (!__global__) return naiveFallback();
    			return __global__;
    		} finally {
    			delete Object.prototype.__global__;
    		}
    	})();
    	return global$1;
    }

    var name = "websocket";
    var description = "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.";
    var keywords = [
    	"websocket",
    	"websockets",
    	"socket",
    	"networking",
    	"comet",
    	"push",
    	"RFC-6455",
    	"realtime",
    	"server",
    	"client"
    ];
    var author = "Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)";
    var contributors = [
    	"Iñaki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)"
    ];
    var version$5 = "1.0.34";
    var repository = {
    	type: "git",
    	url: "https://github.com/theturtle32/WebSocket-Node.git"
    };
    var homepage = "https://github.com/theturtle32/WebSocket-Node";
    var engines = {
    	node: ">=4.0.0"
    };
    var dependencies = {
    	bufferutil: "^4.0.1",
    	debug: "^2.2.0",
    	"es5-ext": "^0.10.50",
    	"typedarray-to-buffer": "^3.1.5",
    	"utf-8-validate": "^5.0.2",
    	yaeti: "^0.0.6"
    };
    var devDependencies = {
    	"buffer-equal": "^1.0.0",
    	gulp: "^4.0.2",
    	"gulp-jshint": "^2.0.4",
    	"jshint-stylish": "^2.2.1",
    	jshint: "^2.0.0",
    	tape: "^4.9.1"
    };
    var config = {
    	verbose: false
    };
    var scripts = {
    	test: "tape test/unit/*.js",
    	gulp: "gulp"
    };
    var main = "index";
    var directories = {
    	lib: "./lib"
    };
    var browser$1 = "lib/browser.js";
    var license = "Apache-2.0";
    var require$$0 = {
    	name: name,
    	description: description,
    	keywords: keywords,
    	author: author,
    	contributors: contributors,
    	version: version$5,
    	repository: repository,
    	homepage: homepage,
    	engines: engines,
    	dependencies: dependencies,
    	devDependencies: devDependencies,
    	config: config,
    	scripts: scripts,
    	main: main,
    	directories: directories,
    	browser: browser$1,
    	license: license
    };

    var version$4 = require$$0.version;

    var _globalThis;
    if (typeof globalThis === 'object') {
    	_globalThis = globalThis;
    } else {
    	try {
    		_globalThis = requireGlobal();
    	} catch (error) {
    	} finally {
    		if (!_globalThis && typeof window !== 'undefined') { _globalThis = window; }
    		if (!_globalThis) { throw new Error('Could not determine global this'); }
    	}
    }

    var NativeWebSocket = _globalThis.WebSocket || _globalThis.MozWebSocket;
    var websocket_version = version$4;


    /**
     * Expose a W3C WebSocket class with just one or two arguments.
     */
    function W3CWebSocket(uri, protocols) {
    	var native_instance;

    	if (protocols) {
    		native_instance = new NativeWebSocket(uri, protocols);
    	}
    	else {
    		native_instance = new NativeWebSocket(uri);
    	}

    	/**
    	 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
    	 * class). Since it is an Object it will be returned as it is when creating an
    	 * instance of W3CWebSocket via 'new W3CWebSocket()'.
    	 *
    	 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
    	 */
    	return native_instance;
    }
    if (NativeWebSocket) {
    	['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function(prop) {
    		Object.defineProperty(W3CWebSocket, prop, {
    			get: function() { return NativeWebSocket[prop]; }
    		});
    	});
    }

    /**
     * Module exports.
     */
    var browser = {
        'w3cwebsocket' : NativeWebSocket ? W3CWebSocket : null,
        'version'      : websocket_version
    };

    const version$3 = '2.7.3';

    const DEFAULT_HEADERS$3 = { 'X-Client-Info': `realtime-js/${version$3}` };
    const VSN = '1.0.0';
    const DEFAULT_TIMEOUT = 10000;
    const WS_CLOSE_NORMAL = 1000;
    var SOCKET_STATES;
    (function (SOCKET_STATES) {
        SOCKET_STATES[SOCKET_STATES["connecting"] = 0] = "connecting";
        SOCKET_STATES[SOCKET_STATES["open"] = 1] = "open";
        SOCKET_STATES[SOCKET_STATES["closing"] = 2] = "closing";
        SOCKET_STATES[SOCKET_STATES["closed"] = 3] = "closed";
    })(SOCKET_STATES || (SOCKET_STATES = {}));
    var CHANNEL_STATES;
    (function (CHANNEL_STATES) {
        CHANNEL_STATES["closed"] = "closed";
        CHANNEL_STATES["errored"] = "errored";
        CHANNEL_STATES["joined"] = "joined";
        CHANNEL_STATES["joining"] = "joining";
        CHANNEL_STATES["leaving"] = "leaving";
    })(CHANNEL_STATES || (CHANNEL_STATES = {}));
    var CHANNEL_EVENTS;
    (function (CHANNEL_EVENTS) {
        CHANNEL_EVENTS["close"] = "phx_close";
        CHANNEL_EVENTS["error"] = "phx_error";
        CHANNEL_EVENTS["join"] = "phx_join";
        CHANNEL_EVENTS["reply"] = "phx_reply";
        CHANNEL_EVENTS["leave"] = "phx_leave";
        CHANNEL_EVENTS["access_token"] = "access_token";
    })(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
    var TRANSPORTS;
    (function (TRANSPORTS) {
        TRANSPORTS["websocket"] = "websocket";
    })(TRANSPORTS || (TRANSPORTS = {}));
    var CONNECTION_STATE;
    (function (CONNECTION_STATE) {
        CONNECTION_STATE["Connecting"] = "connecting";
        CONNECTION_STATE["Open"] = "open";
        CONNECTION_STATE["Closing"] = "closing";
        CONNECTION_STATE["Closed"] = "closed";
    })(CONNECTION_STATE || (CONNECTION_STATE = {}));

    /**
     * Creates a timer that accepts a `timerCalc` function to perform calculated timeout retries, such as exponential backoff.
     *
     * @example
     *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
     *      return [1000, 5000, 10000][tries - 1] || 10000
     *    })
     *    reconnectTimer.scheduleTimeout() // fires after 1000
     *    reconnectTimer.scheduleTimeout() // fires after 5000
     *    reconnectTimer.reset()
     *    reconnectTimer.scheduleTimeout() // fires after 1000
     */
    class Timer {
        constructor(callback, timerCalc) {
            this.callback = callback;
            this.timerCalc = timerCalc;
            this.timer = undefined;
            this.tries = 0;
            this.callback = callback;
            this.timerCalc = timerCalc;
        }
        reset() {
            this.tries = 0;
            clearTimeout(this.timer);
        }
        // Cancels any previous scheduleTimeout and schedules callback
        scheduleTimeout() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.tries = this.tries + 1;
                this.callback();
            }, this.timerCalc(this.tries + 1));
        }
    }

    // This file draws heavily from https://github.com/phoenixframework/phoenix/commit/cf098e9cf7a44ee6479d31d911a97d3c7430c6fe
    // License: https://github.com/phoenixframework/phoenix/blob/master/LICENSE.md
    class Serializer {
        constructor() {
            this.HEADER_LENGTH = 1;
        }
        decode(rawPayload, callback) {
            if (rawPayload.constructor === ArrayBuffer) {
                return callback(this._binaryDecode(rawPayload));
            }
            if (typeof rawPayload === 'string') {
                return callback(JSON.parse(rawPayload));
            }
            return callback({});
        }
        _binaryDecode(buffer) {
            const view = new DataView(buffer);
            const decoder = new TextDecoder();
            return this._decodeBroadcast(buffer, view, decoder);
        }
        _decodeBroadcast(buffer, view, decoder) {
            const topicSize = view.getUint8(1);
            const eventSize = view.getUint8(2);
            let offset = this.HEADER_LENGTH + 2;
            const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
            offset = offset + topicSize;
            const event = decoder.decode(buffer.slice(offset, offset + eventSize));
            offset = offset + eventSize;
            const data = JSON.parse(decoder.decode(buffer.slice(offset, buffer.byteLength)));
            return { ref: null, topic: topic, event: event, payload: data };
        }
    }

    class Push {
        /**
         * Initializes the Push
         *
         * @param channel The Channel
         * @param event The event, for example `"phx_join"`
         * @param payload The payload, for example `{user_id: 123}`
         * @param timeout The push timeout in milliseconds
         */
        constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
            this.channel = channel;
            this.event = event;
            this.payload = payload;
            this.timeout = timeout;
            this.sent = false;
            this.timeoutTimer = undefined;
            this.ref = '';
            this.receivedResp = null;
            this.recHooks = [];
            this.refEvent = null;
            this.rateLimited = false;
        }
        resend(timeout) {
            this.timeout = timeout;
            this._cancelRefEvent();
            this.ref = '';
            this.refEvent = null;
            this.receivedResp = null;
            this.sent = false;
            this.send();
        }
        send() {
            if (this._hasReceived('timeout')) {
                return;
            }
            this.startTimeout();
            this.sent = true;
            const status = this.channel.socket.push({
                topic: this.channel.topic,
                event: this.event,
                payload: this.payload,
                ref: this.ref,
                join_ref: this.channel._joinRef(),
            });
            if (status === 'rate limited') {
                this.rateLimited = true;
            }
        }
        updatePayload(payload) {
            this.payload = Object.assign(Object.assign({}, this.payload), payload);
        }
        receive(status, callback) {
            var _a;
            if (this._hasReceived(status)) {
                callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
            }
            this.recHooks.push({ status, callback });
            return this;
        }
        startTimeout() {
            if (this.timeoutTimer) {
                return;
            }
            this.ref = this.channel.socket._makeRef();
            this.refEvent = this.channel._replyEventName(this.ref);
            const callback = (payload) => {
                this._cancelRefEvent();
                this._cancelTimeout();
                this.receivedResp = payload;
                this._matchReceive(payload);
            };
            this.channel._on(this.refEvent, {}, callback);
            this.timeoutTimer = setTimeout(() => {
                this.trigger('timeout', {});
            }, this.timeout);
        }
        trigger(status, response) {
            if (this.refEvent)
                this.channel._trigger(this.refEvent, { status, response });
        }
        destroy() {
            this._cancelRefEvent();
            this._cancelTimeout();
        }
        _cancelRefEvent() {
            if (!this.refEvent) {
                return;
            }
            this.channel._off(this.refEvent, {});
        }
        _cancelTimeout() {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = undefined;
        }
        _matchReceive({ status, response, }) {
            this.recHooks
                .filter((h) => h.status === status)
                .forEach((h) => h.callback(response));
        }
        _hasReceived(status) {
            return this.receivedResp && this.receivedResp.status === status;
        }
    }

    /*
      This file draws heavily from https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/assets/js/phoenix/presence.js
      License: https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/LICENSE.md
    */
    var REALTIME_PRESENCE_LISTEN_EVENTS;
    (function (REALTIME_PRESENCE_LISTEN_EVENTS) {
        REALTIME_PRESENCE_LISTEN_EVENTS["SYNC"] = "sync";
        REALTIME_PRESENCE_LISTEN_EVENTS["JOIN"] = "join";
        REALTIME_PRESENCE_LISTEN_EVENTS["LEAVE"] = "leave";
    })(REALTIME_PRESENCE_LISTEN_EVENTS || (REALTIME_PRESENCE_LISTEN_EVENTS = {}));
    class RealtimePresence {
        /**
         * Initializes the Presence.
         *
         * @param channel - The RealtimeChannel
         * @param opts - The options,
         *        for example `{events: {state: 'state', diff: 'diff'}}`
         */
        constructor(channel, opts) {
            this.channel = channel;
            this.state = {};
            this.pendingDiffs = [];
            this.joinRef = null;
            this.caller = {
                onJoin: () => { },
                onLeave: () => { },
                onSync: () => { },
            };
            const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
                state: 'presence_state',
                diff: 'presence_diff',
            };
            this.channel._on(events.state, {}, (newState) => {
                const { onJoin, onLeave, onSync } = this.caller;
                this.joinRef = this.channel._joinRef();
                this.state = RealtimePresence.syncState(this.state, newState, onJoin, onLeave);
                this.pendingDiffs.forEach((diff) => {
                    this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
                });
                this.pendingDiffs = [];
                onSync();
            });
            this.channel._on(events.diff, {}, (diff) => {
                const { onJoin, onLeave, onSync } = this.caller;
                if (this.inPendingSyncState()) {
                    this.pendingDiffs.push(diff);
                }
                else {
                    this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
                    onSync();
                }
            });
            this.onJoin((key, currentPresences, newPresences) => {
                this.channel._trigger('presence', {
                    event: 'join',
                    key,
                    currentPresences,
                    newPresences,
                });
            });
            this.onLeave((key, currentPresences, leftPresences) => {
                this.channel._trigger('presence', {
                    event: 'leave',
                    key,
                    currentPresences,
                    leftPresences,
                });
            });
            this.onSync(() => {
                this.channel._trigger('presence', { event: 'sync' });
            });
        }
        /**
         * Used to sync the list of presences on the server with the
         * client's state.
         *
         * An optional `onJoin` and `onLeave` callback can be provided to
         * react to changes in the client's local presences across
         * disconnects and reconnects with the server.
         *
         * @internal
         */
        static syncState(currentState, newState, onJoin, onLeave) {
            const state = this.cloneDeep(currentState);
            const transformedState = this.transformState(newState);
            const joins = {};
            const leaves = {};
            this.map(state, (key, presences) => {
                if (!transformedState[key]) {
                    leaves[key] = presences;
                }
            });
            this.map(transformedState, (key, newPresences) => {
                const currentPresences = state[key];
                if (currentPresences) {
                    const newPresenceRefs = newPresences.map((m) => m.presence_ref);
                    const curPresenceRefs = currentPresences.map((m) => m.presence_ref);
                    const joinedPresences = newPresences.filter((m) => curPresenceRefs.indexOf(m.presence_ref) < 0);
                    const leftPresences = currentPresences.filter((m) => newPresenceRefs.indexOf(m.presence_ref) < 0);
                    if (joinedPresences.length > 0) {
                        joins[key] = joinedPresences;
                    }
                    if (leftPresences.length > 0) {
                        leaves[key] = leftPresences;
                    }
                }
                else {
                    joins[key] = newPresences;
                }
            });
            return this.syncDiff(state, { joins, leaves }, onJoin, onLeave);
        }
        /**
         * Used to sync a diff of presence join and leave events from the
         * server, as they happen.
         *
         * Like `syncState`, `syncDiff` accepts optional `onJoin` and
         * `onLeave` callbacks to react to a user joining or leaving from a
         * device.
         *
         * @internal
         */
        static syncDiff(state, diff, onJoin, onLeave) {
            const { joins, leaves } = {
                joins: this.transformState(diff.joins),
                leaves: this.transformState(diff.leaves),
            };
            if (!onJoin) {
                onJoin = () => { };
            }
            if (!onLeave) {
                onLeave = () => { };
            }
            this.map(joins, (key, newPresences) => {
                var _a;
                const currentPresences = (_a = state[key]) !== null && _a !== void 0 ? _a : [];
                state[key] = this.cloneDeep(newPresences);
                if (currentPresences.length > 0) {
                    const joinedPresenceRefs = state[key].map((m) => m.presence_ref);
                    const curPresences = currentPresences.filter((m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0);
                    state[key].unshift(...curPresences);
                }
                onJoin(key, currentPresences, newPresences);
            });
            this.map(leaves, (key, leftPresences) => {
                let currentPresences = state[key];
                if (!currentPresences)
                    return;
                const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref);
                currentPresences = currentPresences.filter((m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0);
                state[key] = currentPresences;
                onLeave(key, currentPresences, leftPresences);
                if (currentPresences.length === 0)
                    delete state[key];
            });
            return state;
        }
        /** @internal */
        static map(obj, func) {
            return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
        }
        /**
         * Remove 'metas' key
         * Change 'phx_ref' to 'presence_ref'
         * Remove 'phx_ref' and 'phx_ref_prev'
         *
         * @example
         * // returns {
         *  abc123: [
         *    { presence_ref: '2', user_id: 1 },
         *    { presence_ref: '3', user_id: 2 }
         *  ]
         * }
         * RealtimePresence.transformState({
         *  abc123: {
         *    metas: [
         *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
         *      { phx_ref: '3', user_id: 2 }
         *    ]
         *  }
         * })
         *
         * @internal
         */
        static transformState(state) {
            state = this.cloneDeep(state);
            return Object.getOwnPropertyNames(state).reduce((newState, key) => {
                const presences = state[key];
                if ('metas' in presences) {
                    newState[key] = presences.metas.map((presence) => {
                        presence['presence_ref'] = presence['phx_ref'];
                        delete presence['phx_ref'];
                        delete presence['phx_ref_prev'];
                        return presence;
                    });
                }
                else {
                    newState[key] = presences;
                }
                return newState;
            }, {});
        }
        /** @internal */
        static cloneDeep(obj) {
            return JSON.parse(JSON.stringify(obj));
        }
        /** @internal */
        onJoin(callback) {
            this.caller.onJoin = callback;
        }
        /** @internal */
        onLeave(callback) {
            this.caller.onLeave = callback;
        }
        /** @internal */
        onSync(callback) {
            this.caller.onSync = callback;
        }
        /** @internal */
        inPendingSyncState() {
            return !this.joinRef || this.joinRef !== this.channel._joinRef();
        }
    }

    /**
     * Helpers to convert the change Payload into native JS types.
     */
    // Adapted from epgsql (src/epgsql_binary.erl), this module licensed under
    // 3-clause BSD found here: https://raw.githubusercontent.com/epgsql/epgsql/devel/LICENSE
    var PostgresTypes;
    (function (PostgresTypes) {
        PostgresTypes["abstime"] = "abstime";
        PostgresTypes["bool"] = "bool";
        PostgresTypes["date"] = "date";
        PostgresTypes["daterange"] = "daterange";
        PostgresTypes["float4"] = "float4";
        PostgresTypes["float8"] = "float8";
        PostgresTypes["int2"] = "int2";
        PostgresTypes["int4"] = "int4";
        PostgresTypes["int4range"] = "int4range";
        PostgresTypes["int8"] = "int8";
        PostgresTypes["int8range"] = "int8range";
        PostgresTypes["json"] = "json";
        PostgresTypes["jsonb"] = "jsonb";
        PostgresTypes["money"] = "money";
        PostgresTypes["numeric"] = "numeric";
        PostgresTypes["oid"] = "oid";
        PostgresTypes["reltime"] = "reltime";
        PostgresTypes["text"] = "text";
        PostgresTypes["time"] = "time";
        PostgresTypes["timestamp"] = "timestamp";
        PostgresTypes["timestamptz"] = "timestamptz";
        PostgresTypes["timetz"] = "timetz";
        PostgresTypes["tsrange"] = "tsrange";
        PostgresTypes["tstzrange"] = "tstzrange";
    })(PostgresTypes || (PostgresTypes = {}));
    /**
     * Takes an array of columns and an object of string values then converts each string value
     * to its mapped type.
     *
     * @param {{name: String, type: String}[]} columns
     * @param {Object} record
     * @param {Object} options The map of various options that can be applied to the mapper
     * @param {Array} options.skipTypes The array of types that should not be converted
     *
     * @example convertChangeData([{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age:'33'}, {})
     * //=>{ first_name: 'Paul', age: 33 }
     */
    const convertChangeData = (columns, record, options = {}) => {
        var _a;
        const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
        return Object.keys(record).reduce((acc, rec_key) => {
            acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
            return acc;
        }, {});
    };
    /**
     * Converts the value of an individual column.
     *
     * @param {String} columnName The column that you want to convert
     * @param {{name: String, type: String}[]} columns All of the columns
     * @param {Object} record The map of string values
     * @param {Array} skipTypes An array of types that should not be converted
     * @return {object} Useless information
     *
     * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, [])
     * //=> 33
     * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, ['int4'])
     * //=> "33"
     */
    const convertColumn = (columnName, columns, record, skipTypes) => {
        const column = columns.find((x) => x.name === columnName);
        const colType = column === null || column === void 0 ? void 0 : column.type;
        const value = record[columnName];
        if (colType && !skipTypes.includes(colType)) {
            return convertCell(colType, value);
        }
        return noop$1(value);
    };
    /**
     * If the value of the cell is `null`, returns null.
     * Otherwise converts the string value to the correct type.
     * @param {String} type A postgres column type
     * @param {String} value The cell value
     *
     * @example convertCell('bool', 't')
     * //=> true
     * @example convertCell('int8', '10')
     * //=> 10
     * @example convertCell('_int4', '{1,2,3,4}')
     * //=> [1,2,3,4]
     */
    const convertCell = (type, value) => {
        // if data type is an array
        if (type.charAt(0) === '_') {
            const dataType = type.slice(1, type.length);
            return toArray(value, dataType);
        }
        // If not null, convert to correct type.
        switch (type) {
            case PostgresTypes.bool:
                return toBoolean(value);
            case PostgresTypes.float4:
            case PostgresTypes.float8:
            case PostgresTypes.int2:
            case PostgresTypes.int4:
            case PostgresTypes.int8:
            case PostgresTypes.numeric:
            case PostgresTypes.oid:
                return toNumber(value);
            case PostgresTypes.json:
            case PostgresTypes.jsonb:
                return toJson(value);
            case PostgresTypes.timestamp:
                return toTimestampString(value); // Format to be consistent with PostgREST
            case PostgresTypes.abstime: // To allow users to cast it based on Timezone
            case PostgresTypes.date: // To allow users to cast it based on Timezone
            case PostgresTypes.daterange:
            case PostgresTypes.int4range:
            case PostgresTypes.int8range:
            case PostgresTypes.money:
            case PostgresTypes.reltime: // To allow users to cast it based on Timezone
            case PostgresTypes.text:
            case PostgresTypes.time: // To allow users to cast it based on Timezone
            case PostgresTypes.timestamptz: // To allow users to cast it based on Timezone
            case PostgresTypes.timetz: // To allow users to cast it based on Timezone
            case PostgresTypes.tsrange:
            case PostgresTypes.tstzrange:
                return noop$1(value);
            default:
                // Return the value for remaining types
                return noop$1(value);
        }
    };
    const noop$1 = (value) => {
        return value;
    };
    const toBoolean = (value) => {
        switch (value) {
            case 't':
                return true;
            case 'f':
                return false;
            default:
                return value;
        }
    };
    const toNumber = (value) => {
        if (typeof value === 'string') {
            const parsedValue = parseFloat(value);
            if (!Number.isNaN(parsedValue)) {
                return parsedValue;
            }
        }
        return value;
    };
    const toJson = (value) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch (error) {
                console.log(`JSON parse error: ${error}`);
                return value;
            }
        }
        return value;
    };
    /**
     * Converts a Postgres Array into a native JS array
     *
     * @example toArray('{}', 'int4')
     * //=> []
     * @example toArray('{"[2021-01-01,2021-12-31)","(2021-01-01,2021-12-32]"}', 'daterange')
     * //=> ['[2021-01-01,2021-12-31)', '(2021-01-01,2021-12-32]']
     * @example toArray([1,2,3,4], 'int4')
     * //=> [1,2,3,4]
     */
    const toArray = (value, type) => {
        if (typeof value !== 'string') {
            return value;
        }
        const lastIdx = value.length - 1;
        const closeBrace = value[lastIdx];
        const openBrace = value[0];
        // Confirm value is a Postgres array by checking curly brackets
        if (openBrace === '{' && closeBrace === '}') {
            let arr;
            const valTrim = value.slice(1, lastIdx);
            // TODO: find a better solution to separate Postgres array data
            try {
                arr = JSON.parse('[' + valTrim + ']');
            }
            catch (_) {
                // WARNING: splitting on comma does not cover all edge cases
                arr = valTrim ? valTrim.split(',') : [];
            }
            return arr.map((val) => convertCell(type, val));
        }
        return value;
    };
    /**
     * Fixes timestamp to be ISO-8601. Swaps the space between the date and time for a 'T'
     * See https://github.com/supabase/supabase/issues/18
     *
     * @example toTimestampString('2019-09-10 00:00:00')
     * //=> '2019-09-10T00:00:00'
     */
    const toTimestampString = (value) => {
        if (typeof value === 'string') {
            return value.replace(' ', 'T');
        }
        return value;
    };

    var __awaiter$b = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT;
    (function (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT) {
        REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["ALL"] = "*";
        REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["INSERT"] = "INSERT";
        REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["UPDATE"] = "UPDATE";
        REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["DELETE"] = "DELETE";
    })(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
    var REALTIME_LISTEN_TYPES;
    (function (REALTIME_LISTEN_TYPES) {
        REALTIME_LISTEN_TYPES["BROADCAST"] = "broadcast";
        REALTIME_LISTEN_TYPES["PRESENCE"] = "presence";
        /**
         * listen to Postgres changes.
         */
        REALTIME_LISTEN_TYPES["POSTGRES_CHANGES"] = "postgres_changes";
    })(REALTIME_LISTEN_TYPES || (REALTIME_LISTEN_TYPES = {}));
    var REALTIME_SUBSCRIBE_STATES;
    (function (REALTIME_SUBSCRIBE_STATES) {
        REALTIME_SUBSCRIBE_STATES["SUBSCRIBED"] = "SUBSCRIBED";
        REALTIME_SUBSCRIBE_STATES["TIMED_OUT"] = "TIMED_OUT";
        REALTIME_SUBSCRIBE_STATES["CLOSED"] = "CLOSED";
        REALTIME_SUBSCRIBE_STATES["CHANNEL_ERROR"] = "CHANNEL_ERROR";
    })(REALTIME_SUBSCRIBE_STATES || (REALTIME_SUBSCRIBE_STATES = {}));
    /** A channel is the basic building block of Realtime
     * and narrows the scope of data flow to subscribed clients.
     * You can think of a channel as a chatroom where participants are able to see who's online
     * and send and receive messages.
     **/
    class RealtimeChannel {
        constructor(
        /** Topic name can be any string. */
        topic, params = { config: {} }, socket) {
            this.topic = topic;
            this.params = params;
            this.socket = socket;
            this.bindings = {};
            this.state = CHANNEL_STATES.closed;
            this.joinedOnce = false;
            this.pushBuffer = [];
            this.params.config = Object.assign({
                broadcast: { ack: false, self: false },
                presence: { key: '' },
            }, params.config);
            this.timeout = this.socket.timeout;
            this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
            this.rejoinTimer = new Timer(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
            this.joinPush.receive('ok', () => {
                this.state = CHANNEL_STATES.joined;
                this.rejoinTimer.reset();
                this.pushBuffer.forEach((pushEvent) => pushEvent.send());
                this.pushBuffer = [];
            });
            this._onClose(() => {
                this.rejoinTimer.reset();
                this.socket.log('channel', `close ${this.topic} ${this._joinRef()}`);
                this.state = CHANNEL_STATES.closed;
                this.socket._remove(this);
            });
            this._onError((reason) => {
                if (this._isLeaving() || this._isClosed()) {
                    return;
                }
                this.socket.log('channel', `error ${this.topic}`, reason);
                this.state = CHANNEL_STATES.errored;
                this.rejoinTimer.scheduleTimeout();
            });
            this.joinPush.receive('timeout', () => {
                if (!this._isJoining()) {
                    return;
                }
                this.socket.log('channel', `timeout ${this.topic}`, this.joinPush.timeout);
                this.state = CHANNEL_STATES.errored;
                this.rejoinTimer.scheduleTimeout();
            });
            this._on(CHANNEL_EVENTS.reply, {}, (payload, ref) => {
                this._trigger(this._replyEventName(ref), payload);
            });
            this.presence = new RealtimePresence(this);
        }
        /** Subscribe registers your client with the server */
        subscribe(callback, timeout = this.timeout) {
            var _a, _b;
            if (this.joinedOnce) {
                throw `tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance`;
            }
            else {
                const { config: { broadcast, presence }, } = this.params;
                this._onError((e) => callback && callback('CHANNEL_ERROR', e));
                this._onClose(() => callback && callback('CLOSED'));
                const accessTokenPayload = {};
                const config = {
                    broadcast,
                    presence,
                    postgres_changes: (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r) => r.filter)) !== null && _b !== void 0 ? _b : [],
                };
                if (this.socket.accessToken) {
                    accessTokenPayload.access_token = this.socket.accessToken;
                }
                this.updateJoinPayload(Object.assign({ config }, accessTokenPayload));
                this.joinedOnce = true;
                this._rejoin(timeout);
                this.joinPush
                    .receive('ok', ({ postgres_changes: serverPostgresFilters, }) => {
                    var _a;
                    this.socket.accessToken &&
                        this.socket.setAuth(this.socket.accessToken);
                    if (serverPostgresFilters === undefined) {
                        callback && callback('SUBSCRIBED');
                        return;
                    }
                    else {
                        const clientPostgresBindings = this.bindings.postgres_changes;
                        const bindingsLen = (_a = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a !== void 0 ? _a : 0;
                        const newPostgresBindings = [];
                        for (let i = 0; i < bindingsLen; i++) {
                            const clientPostgresBinding = clientPostgresBindings[i];
                            const { filter: { event, schema, table, filter }, } = clientPostgresBinding;
                            const serverPostgresFilter = serverPostgresFilters && serverPostgresFilters[i];
                            if (serverPostgresFilter &&
                                serverPostgresFilter.event === event &&
                                serverPostgresFilter.schema === schema &&
                                serverPostgresFilter.table === table &&
                                serverPostgresFilter.filter === filter) {
                                newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), { id: serverPostgresFilter.id }));
                            }
                            else {
                                this.unsubscribe();
                                callback &&
                                    callback('CHANNEL_ERROR', new Error('mismatch between server and client bindings for postgres changes'));
                                return;
                            }
                        }
                        this.bindings.postgres_changes = newPostgresBindings;
                        callback && callback('SUBSCRIBED');
                        return;
                    }
                })
                    .receive('error', (error) => {
                    callback &&
                        callback('CHANNEL_ERROR', new Error(JSON.stringify(Object.values(error).join(', ') || 'error')));
                    return;
                })
                    .receive('timeout', () => {
                    callback && callback('TIMED_OUT');
                    return;
                });
            }
            return this;
        }
        presenceState() {
            return this.presence.state;
        }
        track(payload, opts = {}) {
            return __awaiter$b(this, void 0, void 0, function* () {
                return yield this.send({
                    type: 'presence',
                    event: 'track',
                    payload,
                }, opts.timeout || this.timeout);
            });
        }
        untrack(opts = {}) {
            return __awaiter$b(this, void 0, void 0, function* () {
                return yield this.send({
                    type: 'presence',
                    event: 'untrack',
                }, opts);
            });
        }
        on(type, filter, callback) {
            return this._on(type, filter, callback);
        }
        send(payload, opts = {}) {
            return new Promise((resolve) => {
                var _a, _b, _c;
                const push = this._push(payload.type, payload, opts.timeout || this.timeout);
                if (push.rateLimited) {
                    resolve('rate limited');
                }
                if (payload.type === 'broadcast' &&
                    !((_c = (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
                    resolve('ok');
                }
                push.receive('ok', () => resolve('ok'));
                push.receive('timeout', () => resolve('timed out'));
            });
        }
        updateJoinPayload(payload) {
            this.joinPush.updatePayload(payload);
        }
        /**
         * Leaves the channel.
         *
         * Unsubscribes from server events, and instructs channel to terminate on server.
         * Triggers onClose() hooks.
         *
         * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
         * channel.unsubscribe().receive("ok", () => alert("left!") )
         */
        unsubscribe(timeout = this.timeout) {
            this.state = CHANNEL_STATES.leaving;
            const onClose = () => {
                this.socket.log('channel', `leave ${this.topic}`);
                this._trigger(CHANNEL_EVENTS.close, 'leave', this._joinRef());
            };
            this.rejoinTimer.reset();
            // Destroy joinPush to avoid connection timeouts during unscription phase
            this.joinPush.destroy();
            return new Promise((resolve) => {
                const leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
                leavePush
                    .receive('ok', () => {
                    onClose();
                    resolve('ok');
                })
                    .receive('timeout', () => {
                    onClose();
                    resolve('timed out');
                })
                    .receive('error', () => {
                    resolve('error');
                });
                leavePush.send();
                if (!this._canPush()) {
                    leavePush.trigger('ok', {});
                }
            });
        }
        /** @internal */
        _push(event, payload, timeout = this.timeout) {
            if (!this.joinedOnce) {
                throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
            }
            let pushEvent = new Push(this, event, payload, timeout);
            if (this._canPush()) {
                pushEvent.send();
            }
            else {
                pushEvent.startTimeout();
                this.pushBuffer.push(pushEvent);
            }
            return pushEvent;
        }
        /**
         * Overridable message hook
         *
         * Receives all events for specialized message handling before dispatching to the channel callbacks.
         * Must return the payload, modified or unmodified.
         *
         * @internal
         */
        _onMessage(_event, payload, _ref) {
            return payload;
        }
        /** @internal */
        _isMember(topic) {
            return this.topic === topic;
        }
        /** @internal */
        _joinRef() {
            return this.joinPush.ref;
        }
        /** @internal */
        _trigger(type, payload, ref) {
            var _a, _b;
            const typeLower = type.toLocaleLowerCase();
            const { close, error, leave, join } = CHANNEL_EVENTS;
            const events = [close, error, leave, join];
            if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
                return;
            }
            let handledPayload = this._onMessage(typeLower, payload, ref);
            if (payload && !handledPayload) {
                throw 'channel onMessage callbacks must return the payload, modified or unmodified';
            }
            if (['insert', 'update', 'delete'].includes(typeLower)) {
                (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.filter((bind) => {
                    var _a, _b, _c;
                    return (((_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event) === '*' ||
                        ((_c = (_b = bind.filter) === null || _b === void 0 ? void 0 : _b.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower);
                }).map((bind) => bind.callback(handledPayload, ref));
            }
            else {
                (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind) => {
                    var _a, _b, _c, _d, _e, _f;
                    if (['broadcast', 'presence', 'postgres_changes'].includes(typeLower)) {
                        if ('id' in bind) {
                            const bindId = bind.id;
                            const bindEvent = (_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event;
                            return (bindId &&
                                ((_b = payload.ids) === null || _b === void 0 ? void 0 : _b.includes(bindId)) &&
                                (bindEvent === '*' ||
                                    (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) ===
                                        ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase())));
                        }
                        else {
                            const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
                            return (bindEvent === '*' ||
                                bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase()));
                        }
                    }
                    else {
                        return bind.type.toLocaleLowerCase() === typeLower;
                    }
                }).map((bind) => {
                    if (typeof handledPayload === 'object' && 'ids' in handledPayload) {
                        const postgresChanges = handledPayload.data;
                        const { schema, table, commit_timestamp, type, errors } = postgresChanges;
                        const enrichedPayload = {
                            schema: schema,
                            table: table,
                            commit_timestamp: commit_timestamp,
                            eventType: type,
                            new: {},
                            old: {},
                            errors: errors,
                        };
                        handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
                    }
                    bind.callback(handledPayload, ref);
                });
            }
        }
        /** @internal */
        _isClosed() {
            return this.state === CHANNEL_STATES.closed;
        }
        /** @internal */
        _isJoined() {
            return this.state === CHANNEL_STATES.joined;
        }
        /** @internal */
        _isJoining() {
            return this.state === CHANNEL_STATES.joining;
        }
        /** @internal */
        _isLeaving() {
            return this.state === CHANNEL_STATES.leaving;
        }
        /** @internal */
        _replyEventName(ref) {
            return `chan_reply_${ref}`;
        }
        /** @internal */
        _on(type, filter, callback) {
            const typeLower = type.toLocaleLowerCase();
            const binding = {
                type: typeLower,
                filter: filter,
                callback: callback,
            };
            if (this.bindings[typeLower]) {
                this.bindings[typeLower].push(binding);
            }
            else {
                this.bindings[typeLower] = [binding];
            }
            return this;
        }
        /** @internal */
        _off(type, filter) {
            const typeLower = type.toLocaleLowerCase();
            this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
                var _a;
                return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower &&
                    RealtimeChannel.isEqual(bind.filter, filter));
            });
            return this;
        }
        /** @internal */
        static isEqual(obj1, obj2) {
            if (Object.keys(obj1).length !== Object.keys(obj2).length) {
                return false;
            }
            for (const k in obj1) {
                if (obj1[k] !== obj2[k]) {
                    return false;
                }
            }
            return true;
        }
        /** @internal */
        _rejoinUntilConnected() {
            this.rejoinTimer.scheduleTimeout();
            if (this.socket.isConnected()) {
                this._rejoin();
            }
        }
        /**
         * Registers a callback that will be executed when the channel closes.
         *
         * @internal
         */
        _onClose(callback) {
            this._on(CHANNEL_EVENTS.close, {}, callback);
        }
        /**
         * Registers a callback that will be executed when the channel encounteres an error.
         *
         * @internal
         */
        _onError(callback) {
            this._on(CHANNEL_EVENTS.error, {}, (reason) => callback(reason));
        }
        /**
         * Returns `true` if the socket is connected and the channel has been joined.
         *
         * @internal
         */
        _canPush() {
            return this.socket.isConnected() && this._isJoined();
        }
        /** @internal */
        _rejoin(timeout = this.timeout) {
            if (this._isLeaving()) {
                return;
            }
            this.socket._leaveOpenTopic(this.topic);
            this.state = CHANNEL_STATES.joining;
            this.joinPush.resend(timeout);
        }
        /** @internal */
        _getPayloadRecords(payload) {
            const records = {
                new: {},
                old: {},
            };
            if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
                records.new = convertChangeData(payload.columns, payload.record);
            }
            if (payload.type === 'UPDATE' || payload.type === 'DELETE') {
                records.old = convertChangeData(payload.columns, payload.old_record);
            }
            return records;
        }
    }

    var __awaiter$a = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const noop = () => { };
    class RealtimeClient {
        /**
         * Initializes the Socket.
         *
         * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
         * @param options.transport The Websocket Transport, for example WebSocket.
         * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
         * @param options.params The optional params to pass when connecting.
         * @param options.headers The optional headers to pass when connecting.
         * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
         * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
         * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
         * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
         * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
         */
        constructor(endPoint, options) {
            var _a;
            this.accessToken = null;
            this.channels = [];
            this.endPoint = '';
            this.headers = DEFAULT_HEADERS$3;
            this.params = {};
            this.timeout = DEFAULT_TIMEOUT;
            this.transport = browser.w3cwebsocket;
            this.heartbeatIntervalMs = 30000;
            this.heartbeatTimer = undefined;
            this.pendingHeartbeatRef = null;
            this.ref = 0;
            this.logger = noop;
            this.conn = null;
            this.sendBuffer = [];
            this.serializer = new Serializer();
            this.stateChangeCallbacks = {
                open: [],
                close: [],
                error: [],
                message: [],
            };
            this.eventsPerSecondLimitMs = 100;
            this.inThrottle = false;
            this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
            if (options === null || options === void 0 ? void 0 : options.params)
                this.params = options.params;
            if (options === null || options === void 0 ? void 0 : options.headers)
                this.headers = Object.assign(Object.assign({}, this.headers), options.headers);
            if (options === null || options === void 0 ? void 0 : options.timeout)
                this.timeout = options.timeout;
            if (options === null || options === void 0 ? void 0 : options.logger)
                this.logger = options.logger;
            if (options === null || options === void 0 ? void 0 : options.transport)
                this.transport = options.transport;
            if (options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs)
                this.heartbeatIntervalMs = options.heartbeatIntervalMs;
            const eventsPerSecond = (_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.eventsPerSecond;
            if (eventsPerSecond)
                this.eventsPerSecondLimitMs = Math.floor(1000 / eventsPerSecond);
            this.reconnectAfterMs = (options === null || options === void 0 ? void 0 : options.reconnectAfterMs)
                ? options.reconnectAfterMs
                : (tries) => {
                    return [1000, 2000, 5000, 10000][tries - 1] || 10000;
                };
            this.encode = (options === null || options === void 0 ? void 0 : options.encode)
                ? options.encode
                : (payload, callback) => {
                    return callback(JSON.stringify(payload));
                };
            this.decode = (options === null || options === void 0 ? void 0 : options.decode)
                ? options.decode
                : this.serializer.decode.bind(this.serializer);
            this.reconnectTimer = new Timer(() => __awaiter$a(this, void 0, void 0, function* () {
                this.disconnect();
                this.connect();
            }), this.reconnectAfterMs);
        }
        /**
         * Connects the socket, unless already connected.
         */
        connect() {
            if (this.conn) {
                return;
            }
            this.conn = new this.transport(this._endPointURL(), [], null, this.headers);
            if (this.conn) {
                this.conn.binaryType = 'arraybuffer';
                this.conn.onopen = () => this._onConnOpen();
                this.conn.onerror = (error) => this._onConnError(error);
                this.conn.onmessage = (event) => this._onConnMessage(event);
                this.conn.onclose = (event) => this._onConnClose(event);
            }
        }
        /**
         * Disconnects the socket.
         *
         * @param code A numeric status code to send on disconnect.
         * @param reason A custom reason for the disconnect.
         */
        disconnect(code, reason) {
            if (this.conn) {
                this.conn.onclose = function () { }; // noop
                if (code) {
                    this.conn.close(code, reason !== null && reason !== void 0 ? reason : '');
                }
                else {
                    this.conn.close();
                }
                this.conn = null;
                // remove open handles
                this.heartbeatTimer && clearInterval(this.heartbeatTimer);
                this.reconnectTimer.reset();
            }
        }
        /**
         * Returns all created channels
         */
        getChannels() {
            return this.channels;
        }
        /**
         * Unsubscribes and removes a single channel
         * @param channel A RealtimeChannel instance
         */
        removeChannel(channel) {
            return __awaiter$a(this, void 0, void 0, function* () {
                const status = yield channel.unsubscribe();
                if (this.channels.length === 0) {
                    this.disconnect();
                }
                return status;
            });
        }
        /**
         * Unsubscribes and removes all channels
         */
        removeAllChannels() {
            return __awaiter$a(this, void 0, void 0, function* () {
                const values_1 = yield Promise.all(this.channels.map((channel) => channel.unsubscribe()));
                this.disconnect();
                return values_1;
            });
        }
        /**
         * Logs the message.
         *
         * For customized logging, `this.logger` can be overridden.
         */
        log(kind, msg, data) {
            this.logger(kind, msg, data);
        }
        /**
         * Returns the current state of the socket.
         */
        connectionState() {
            switch (this.conn && this.conn.readyState) {
                case SOCKET_STATES.connecting:
                    return CONNECTION_STATE.Connecting;
                case SOCKET_STATES.open:
                    return CONNECTION_STATE.Open;
                case SOCKET_STATES.closing:
                    return CONNECTION_STATE.Closing;
                default:
                    return CONNECTION_STATE.Closed;
            }
        }
        /**
         * Returns `true` is the connection is open.
         */
        isConnected() {
            return this.connectionState() === CONNECTION_STATE.Open;
        }
        channel(topic, params = { config: {} }) {
            if (!this.isConnected()) {
                this.connect();
            }
            const chan = new RealtimeChannel(`realtime:${topic}`, params, this);
            this.channels.push(chan);
            return chan;
        }
        /**
         * Push out a message if the socket is connected.
         *
         * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
         */
        push(data) {
            const { topic, event, payload, ref } = data;
            let callback = () => {
                this.encode(data, (result) => {
                    var _a;
                    (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
                });
            };
            this.log('push', `${topic} ${event} (${ref})`, payload);
            if (this.isConnected()) {
                if (['broadcast', 'presence', 'postgres_changes'].includes(event)) {
                    const isThrottled = this._throttle(callback)();
                    if (isThrottled) {
                        return 'rate limited';
                    }
                }
                else {
                    callback();
                }
            }
            else {
                this.sendBuffer.push(callback);
            }
        }
        /**
         * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
         *
         * @param token A JWT string.
         */
        setAuth(token) {
            this.accessToken = token;
            this.channels.forEach((channel) => {
                token && channel.updateJoinPayload({ access_token: token });
                if (channel.joinedOnce && channel._isJoined()) {
                    channel._push(CHANNEL_EVENTS.access_token, { access_token: token });
                }
            });
        }
        /**
         * Return the next message ref, accounting for overflows
         *
         * @internal
         */
        _makeRef() {
            let newRef = this.ref + 1;
            if (newRef === this.ref) {
                this.ref = 0;
            }
            else {
                this.ref = newRef;
            }
            return this.ref.toString();
        }
        /**
         * Unsubscribe from channels with the specified topic.
         *
         * @internal
         */
        _leaveOpenTopic(topic) {
            let dupChannel = this.channels.find((c) => c.topic === topic && (c._isJoined() || c._isJoining()));
            if (dupChannel) {
                this.log('transport', `leaving duplicate topic "${topic}"`);
                dupChannel.unsubscribe();
            }
        }
        /**
         * Removes a subscription from the socket.
         *
         * @param channel An open subscription.
         *
         * @internal
         */
        _remove(channel) {
            this.channels = this.channels.filter((c) => c._joinRef() !== channel._joinRef());
        }
        /**
         * Returns the URL of the websocket.
         *
         * @internal
         */
        _endPointURL() {
            return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: VSN }));
        }
        /** @internal */
        _onConnMessage(rawMessage) {
            this.decode(rawMessage.data, (msg) => {
                let { topic, event, payload, ref } = msg;
                if ((ref && ref === this.pendingHeartbeatRef) ||
                    event === (payload === null || payload === void 0 ? void 0 : payload.type)) {
                    this.pendingHeartbeatRef = null;
                }
                this.log('receive', `${payload.status || ''} ${topic} ${event} ${(ref && '(' + ref + ')') || ''}`, payload);
                this.channels
                    .filter((channel) => channel._isMember(topic))
                    .forEach((channel) => channel._trigger(event, payload, ref));
                this.stateChangeCallbacks.message.forEach((callback) => callback(msg));
            });
        }
        /** @internal */
        _onConnOpen() {
            this.log('transport', `connected to ${this._endPointURL()}`);
            this._flushSendBuffer();
            this.reconnectTimer.reset();
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = setInterval(() => this._sendHeartbeat(), this.heartbeatIntervalMs);
            this.stateChangeCallbacks.open.forEach((callback) => callback());
        }
        /** @internal */
        _onConnClose(event) {
            this.log('transport', 'close', event);
            this._triggerChanError();
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.reconnectTimer.scheduleTimeout();
            this.stateChangeCallbacks.close.forEach((callback) => callback(event));
        }
        /** @internal */
        _onConnError(error) {
            this.log('transport', error.message);
            this._triggerChanError();
            this.stateChangeCallbacks.error.forEach((callback) => callback(error));
        }
        /** @internal */
        _triggerChanError() {
            this.channels.forEach((channel) => channel._trigger(CHANNEL_EVENTS.error));
        }
        /** @internal */
        _appendParams(url, params) {
            if (Object.keys(params).length === 0) {
                return url;
            }
            const prefix = url.match(/\?/) ? '&' : '?';
            const query = new URLSearchParams(params);
            return `${url}${prefix}${query}`;
        }
        /** @internal */
        _flushSendBuffer() {
            if (this.isConnected() && this.sendBuffer.length > 0) {
                this.sendBuffer.forEach((callback) => callback());
                this.sendBuffer = [];
            }
        }
        /** @internal */
        _sendHeartbeat() {
            var _a;
            if (!this.isConnected()) {
                return;
            }
            if (this.pendingHeartbeatRef) {
                this.pendingHeartbeatRef = null;
                this.log('transport', 'heartbeat timeout. Attempting to re-establish connection');
                (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, 'hearbeat timeout');
                return;
            }
            this.pendingHeartbeatRef = this._makeRef();
            this.push({
                topic: 'phoenix',
                event: 'heartbeat',
                payload: {},
                ref: this.pendingHeartbeatRef,
            });
            this.setAuth(this.accessToken);
        }
        /** @internal */
        _throttle(callback, eventsPerSecondLimitMs = this.eventsPerSecondLimitMs) {
            return () => {
                if (this.inThrottle)
                    return true;
                callback();
                if (eventsPerSecondLimitMs > 0) {
                    this.inThrottle = true;
                    setTimeout(() => {
                        this.inThrottle = false;
                    }, eventsPerSecondLimitMs);
                }
                return false;
            };
        }
    }

    class StorageError extends Error {
        constructor(message) {
            super(message);
            this.__isStorageError = true;
            this.name = 'StorageError';
        }
    }
    function isStorageError(error) {
        return typeof error === 'object' && error !== null && '__isStorageError' in error;
    }
    class StorageApiError extends StorageError {
        constructor(message, status) {
            super(message);
            this.name = 'StorageApiError';
            this.status = status;
        }
        toJSON() {
            return {
                name: this.name,
                message: this.message,
                status: this.status,
            };
        }
    }
    class StorageUnknownError extends StorageError {
        constructor(message, originalError) {
            super(message);
            this.name = 'StorageUnknownError';
            this.originalError = originalError;
        }
    }

    var __awaiter$9 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const resolveFetch$2 = (customFetch) => {
        let _fetch;
        if (customFetch) {
            _fetch = customFetch;
        }
        else if (typeof fetch === 'undefined') {
            _fetch = (...args) => __awaiter$9(void 0, void 0, void 0, function* () { return yield (yield Promise.resolve().then(function () { return browserPonyfill; })).fetch(...args); });
        }
        else {
            _fetch = fetch;
        }
        return (...args) => _fetch(...args);
    };
    const resolveResponse = () => __awaiter$9(void 0, void 0, void 0, function* () {
        if (typeof Response === 'undefined') {
            return (yield Promise.resolve().then(function () { return browserPonyfill; })).Response;
        }
        return Response;
    });

    var __awaiter$8 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const _getErrorMessage$1 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    const handleError$1 = (error, reject) => __awaiter$8(void 0, void 0, void 0, function* () {
        const Res = yield resolveResponse();
        if (error instanceof Res) {
            error
                .json()
                .then((err) => {
                reject(new StorageApiError(_getErrorMessage$1(err), error.status || 500));
            })
                .catch((err) => {
                reject(new StorageUnknownError(_getErrorMessage$1(err), err));
            });
        }
        else {
            reject(new StorageUnknownError(_getErrorMessage$1(error), error));
        }
    });
    const _getRequestParams$1 = (method, options, parameters, body) => {
        const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
        if (method === 'GET') {
            return params;
        }
        params.headers = Object.assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
        return Object.assign(Object.assign({}, params), parameters);
    };
    function _handleRequest$1(fetcher, method, url, options, parameters, body) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fetcher(url, _getRequestParams$1(method, options, parameters, body))
                    .then((result) => {
                    if (!result.ok)
                        throw result;
                    if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                        return result;
                    return result.json();
                })
                    .then((data) => resolve(data))
                    .catch((error) => handleError$1(error, reject));
            });
        });
    }
    function get(fetcher, url, options, parameters) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'GET', url, options, parameters);
        });
    }
    function post(fetcher, url, body, options, parameters) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'POST', url, options, parameters, body);
        });
    }
    function put(fetcher, url, body, options, parameters) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'PUT', url, options, parameters, body);
        });
    }
    function remove(fetcher, url, body, options, parameters) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'DELETE', url, options, parameters, body);
        });
    }

    var __awaiter$7 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const DEFAULT_SEARCH_OPTIONS = {
        limit: 100,
        offset: 0,
        sortBy: {
            column: 'name',
            order: 'asc',
        },
    };
    const DEFAULT_FILE_OPTIONS = {
        cacheControl: '3600',
        contentType: 'text/plain;charset=UTF-8',
        upsert: false,
    };
    class StorageFileApi {
        constructor(url, headers = {}, bucketId, fetch) {
            this.url = url;
            this.headers = headers;
            this.bucketId = bucketId;
            this.fetch = resolveFetch$2(fetch);
        }
        /**
         * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
         *
         * @param method HTTP method.
         * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param fileBody The body of the file to be stored in the bucket.
         */
        uploadOrUpdate(method, path, fileBody, fileOptions) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    let body;
                    const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
                    const headers = Object.assign(Object.assign({}, this.headers), (method === 'POST' && { 'x-upsert': String(options.upsert) }));
                    if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
                        body = new FormData();
                        body.append('cacheControl', options.cacheControl);
                        body.append('', fileBody);
                    }
                    else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
                        body = fileBody;
                        body.append('cacheControl', options.cacheControl);
                    }
                    else {
                        body = fileBody;
                        headers['cache-control'] = `max-age=${options.cacheControl}`;
                        headers['content-type'] = options.contentType;
                    }
                    const cleanPath = this._removeEmptyFolders(path);
                    const _path = this._getFinalPath(cleanPath);
                    const res = yield this.fetch(`${this.url}/object/${_path}`, Object.assign({ method, body: body, headers }, ((options === null || options === void 0 ? void 0 : options.duplex) ? { duplex: options.duplex } : {})));
                    if (res.ok) {
                        return {
                            data: { path: cleanPath },
                            error: null,
                        };
                    }
                    else {
                        const error = yield res.json();
                        return { data: null, error };
                    }
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Uploads a file to an existing bucket.
         *
         * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param fileBody The body of the file to be stored in the bucket.
         */
        upload(path, fileBody, fileOptions) {
            return __awaiter$7(this, void 0, void 0, function* () {
                return this.uploadOrUpdate('POST', path, fileBody, fileOptions);
            });
        }
        /**
         * Upload a file with a token generated from `createSignedUploadUrl`.
         * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param token The token generated from `createSignedUploadUrl`
         * @param fileBody The body of the file to be stored in the bucket.
         */
        uploadToSignedUrl(path, token, fileBody, fileOptions) {
            return __awaiter$7(this, void 0, void 0, function* () {
                const cleanPath = this._removeEmptyFolders(path);
                const _path = this._getFinalPath(cleanPath);
                const url = new URL(this.url + `/object/upload/sign/${_path}`);
                url.searchParams.set('token', token);
                try {
                    let body;
                    const options = Object.assign({ upsert: DEFAULT_FILE_OPTIONS.upsert }, fileOptions);
                    const headers = Object.assign(Object.assign({}, this.headers), { 'x-upsert': String(options.upsert) });
                    if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
                        body = new FormData();
                        body.append('cacheControl', options.cacheControl);
                        body.append('', fileBody);
                    }
                    else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
                        body = fileBody;
                        body.append('cacheControl', options.cacheControl);
                    }
                    else {
                        body = fileBody;
                        headers['cache-control'] = `max-age=${options.cacheControl}`;
                        headers['content-type'] = options.contentType;
                    }
                    const res = yield this.fetch(url.toString(), {
                        method: 'PUT',
                        body: body,
                        headers,
                    });
                    if (res.ok) {
                        return {
                            data: { path: cleanPath },
                            error: null,
                        };
                    }
                    else {
                        const error = yield res.json();
                        return { data: null, error };
                    }
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Creates a signed upload URL.
         * Signed upload URLs can be used to upload files to the bucket without further authentication.
         * They are valid for one minute.
         * @param path The file path, including the current file name. For example `folder/image.png`.
         */
        createSignedUploadUrl(path) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    let _path = this._getFinalPath(path);
                    const data = yield post(this.fetch, `${this.url}/object/upload/sign/${_path}`, {}, { headers: this.headers });
                    const url = new URL(this.url + data.url);
                    const token = url.searchParams.get('token');
                    if (!token) {
                        throw new StorageError('No token returned by API');
                    }
                    return { data: { signedUrl: url.toString(), path, token }, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Replaces an existing file at the specified path with a new one.
         *
         * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
         * @param fileBody The body of the file to be stored in the bucket.
         */
        update(path, fileBody, fileOptions) {
            return __awaiter$7(this, void 0, void 0, function* () {
                return this.uploadOrUpdate('PUT', path, fileBody, fileOptions);
            });
        }
        /**
         * Moves an existing file to a new path in the same bucket.
         *
         * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
         * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
         */
        move(fromPath, toPath) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/object/move`, { bucketId: this.bucketId, sourceKey: fromPath, destinationKey: toPath }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Copies an existing file to a new path in the same bucket.
         *
         * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
         * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
         */
        copy(fromPath, toPath) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/object/copy`, { bucketId: this.bucketId, sourceKey: fromPath, destinationKey: toPath }, { headers: this.headers });
                    return { data: { path: data.Key }, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
         *
         * @param path The file path, including the current file name. For example `folder/image.png`.
         * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
         * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
         * @param options.transform Transform the asset before serving it to the client.
         */
        createSignedUrl(path, expiresIn, options) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    let _path = this._getFinalPath(path);
                    let data = yield post(this.fetch, `${this.url}/object/sign/${_path}`, Object.assign({ expiresIn }, ((options === null || options === void 0 ? void 0 : options.transform) ? { transform: options.transform } : {})), { headers: this.headers });
                    const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
                        ? `&download=${options.download === true ? '' : options.download}`
                        : '';
                    const signedUrl = encodeURI(`${this.url}${data.signedURL}${downloadQueryParam}`);
                    data = { signedUrl };
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
         *
         * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
         * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
         * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
         */
        createSignedUrls(paths, expiresIn, options) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn, paths }, { headers: this.headers });
                    const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
                        ? `&download=${options.download === true ? '' : options.download}`
                        : '';
                    return {
                        data: data.map((datum) => (Object.assign(Object.assign({}, datum), { signedUrl: datum.signedURL
                                ? encodeURI(`${this.url}${datum.signedURL}${downloadQueryParam}`)
                                : null }))),
                        error: null,
                    };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
         *
         * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
         * @param options.transform Transform the asset before serving it to the client.
         */
        download(path, options) {
            return __awaiter$7(this, void 0, void 0, function* () {
                const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== 'undefined';
                const renderPath = wantsTransformation ? 'render/image/authenticated' : 'object';
                const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
                const queryString = transformationQuery ? `?${transformationQuery}` : '';
                try {
                    const _path = this._getFinalPath(path);
                    const res = yield get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
                        headers: this.headers,
                        noResolveJson: true,
                    });
                    const data = yield res.blob();
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
         * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
         *
         * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
         * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
         * @param options.transform Transform the asset before serving it to the client.
         */
        getPublicUrl(path, options) {
            const _path = this._getFinalPath(path);
            const _queryString = [];
            const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
                ? `download=${options.download === true ? '' : options.download}`
                : '';
            if (downloadQueryParam !== '') {
                _queryString.push(downloadQueryParam);
            }
            const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== 'undefined';
            const renderPath = wantsTransformation ? 'render/image' : 'object';
            const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
            if (transformationQuery !== '') {
                _queryString.push(transformationQuery);
            }
            let queryString = _queryString.join('&');
            if (queryString !== '') {
                queryString = `?${queryString}`;
            }
            return {
                data: { publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`) },
            };
        }
        /**
         * Deletes files within the same bucket
         *
         * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
         */
        remove(paths) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield remove(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Get file metadata
         * @param id the file id to retrieve metadata
         */
        // async getMetadata(
        //   id: string
        // ): Promise<
        //   | {
        //       data: Metadata
        //       error: null
        //     }
        //   | {
        //       data: null
        //       error: StorageError
        //     }
        // > {
        //   try {
        //     const data = await get(this.fetch, `${this.url}/metadata/${id}`, { headers: this.headers })
        //     return { data, error: null }
        //   } catch (error) {
        //     if (isStorageError(error)) {
        //       return { data: null, error }
        //     }
        //     throw error
        //   }
        // }
        /**
         * Update file metadata
         * @param id the file id to update metadata
         * @param meta the new file metadata
         */
        // async updateMetadata(
        //   id: string,
        //   meta: Metadata
        // ): Promise<
        //   | {
        //       data: Metadata
        //       error: null
        //     }
        //   | {
        //       data: null
        //       error: StorageError
        //     }
        // > {
        //   try {
        //     const data = await post(
        //       this.fetch,
        //       `${this.url}/metadata/${id}`,
        //       { ...meta },
        //       { headers: this.headers }
        //     )
        //     return { data, error: null }
        //   } catch (error) {
        //     if (isStorageError(error)) {
        //       return { data: null, error }
        //     }
        //     throw error
        //   }
        // }
        /**
         * Lists all the files within a bucket.
         * @param path The folder path.
         */
        list(path, options, parameters) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || '' });
                    const data = yield post(this.fetch, `${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        _getFinalPath(path) {
            return `${this.bucketId}/${path}`;
        }
        _removeEmptyFolders(path) {
            return path.replace(/^\/|\/$/g, '').replace(/\/+/g, '/');
        }
        transformOptsToQueryString(transform) {
            const params = [];
            if (transform.width) {
                params.push(`width=${transform.width}`);
            }
            if (transform.height) {
                params.push(`height=${transform.height}`);
            }
            if (transform.resize) {
                params.push(`resize=${transform.resize}`);
            }
            if (transform.format) {
                params.push(`format=${transform.format}`);
            }
            if (transform.quality) {
                params.push(`quality=${transform.quality}`);
            }
            return params.join('&');
        }
    }

    // generated by genversion
    const version$2 = '2.5.1';

    const DEFAULT_HEADERS$2 = { 'X-Client-Info': `storage-js/${version$2}` };

    var __awaiter$6 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class StorageBucketApi {
        constructor(url, headers = {}, fetch) {
            this.url = url;
            this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$2), headers);
            this.fetch = resolveFetch$2(fetch);
        }
        /**
         * Retrieves the details of all Storage buckets within an existing project.
         */
        listBuckets() {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield get(this.fetch, `${this.url}/bucket`, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Retrieves the details of an existing Storage bucket.
         *
         * @param id The unique identifier of the bucket you would like to retrieve.
         */
        getBucket(id) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield get(this.fetch, `${this.url}/bucket/${id}`, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Creates a new Storage bucket
         *
         * @param id A unique identifier for the bucket you are creating.
         * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
         * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
         * The global file size limit takes precedence over this value.
         * The default value is null, which doesn't set a per bucket file size limit.
         * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
         * The default value is null, which allows files with all mime types to be uploaded.
         * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
         * @returns newly created bucket id
         */
        createBucket(id, options = {
            public: false,
        }) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/bucket`, {
                        id,
                        name: id,
                        public: options.public,
                        file_size_limit: options.fileSizeLimit,
                        allowed_mime_types: options.allowedMimeTypes,
                    }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Updates a Storage bucket
         *
         * @param id A unique identifier for the bucket you are updating.
         * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
         * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
         * The global file size limit takes precedence over this value.
         * The default value is null, which doesn't set a per bucket file size limit.
         * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
         * The default value is null, which allows files with all mime types to be uploaded.
         * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
         */
        updateBucket(id, options) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield put(this.fetch, `${this.url}/bucket/${id}`, {
                        id,
                        name: id,
                        public: options.public,
                        file_size_limit: options.fileSizeLimit,
                        allowed_mime_types: options.allowedMimeTypes,
                    }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Removes all objects inside a single bucket.
         *
         * @param id The unique identifier of the bucket you would like to empty.
         */
        emptyBucket(id) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
         * You must first `empty()` the bucket.
         *
         * @param id The unique identifier of the bucket you would like to delete.
         */
        deleteBucket(id) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield remove(this.fetch, `${this.url}/bucket/${id}`, {}, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    if (isStorageError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
    }

    class StorageClient extends StorageBucketApi {
        constructor(url, headers = {}, fetch) {
            super(url, headers, fetch);
        }
        /**
         * Perform file operation in a bucket.
         *
         * @param id The bucket id to operate on.
         */
        from(id) {
            return new StorageFileApi(this.url, this.headers, id, this.fetch);
        }
    }

    const version$1 = '2.25.0';

    // constants.ts
    const DEFAULT_HEADERS$1 = { 'X-Client-Info': `supabase-js/${version$1}` };

    var __awaiter$5 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const resolveFetch$1 = (customFetch) => {
        let _fetch;
        if (customFetch) {
            _fetch = customFetch;
        }
        else if (typeof fetch === 'undefined') {
            _fetch = crossFetch;
        }
        else {
            _fetch = fetch;
        }
        return (...args) => _fetch(...args);
    };
    const resolveHeadersConstructor = () => {
        if (typeof Headers === 'undefined') {
            return browserPonyfillExports.Headers;
        }
        return Headers;
    };
    const fetchWithAuth = (supabaseKey, getAccessToken, customFetch) => {
        const fetch = resolveFetch$1(customFetch);
        const HeadersConstructor = resolveHeadersConstructor();
        return (input, init) => __awaiter$5(void 0, void 0, void 0, function* () {
            var _a;
            const accessToken = (_a = (yield getAccessToken())) !== null && _a !== void 0 ? _a : supabaseKey;
            let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
            if (!headers.has('apikey')) {
                headers.set('apikey', supabaseKey);
            }
            if (!headers.has('Authorization')) {
                headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return fetch(input, Object.assign(Object.assign({}, init), { headers }));
        });
    };

    function stripTrailingSlash(url) {
        return url.replace(/\/$/, '');
    }
    function applySettingDefaults(options, defaults) {
        const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions, } = options;
        const { db: DEFAULT_DB_OPTIONS, auth: DEFAULT_AUTH_OPTIONS, realtime: DEFAULT_REALTIME_OPTIONS, global: DEFAULT_GLOBAL_OPTIONS, } = defaults;
        return {
            db: Object.assign(Object.assign({}, DEFAULT_DB_OPTIONS), dbOptions),
            auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), authOptions),
            realtime: Object.assign(Object.assign({}, DEFAULT_REALTIME_OPTIONS), realtimeOptions),
            global: Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS), globalOptions),
        };
    }

    var __awaiter$4 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    function expiresAt(expiresIn) {
        const timeNow = Math.round(Date.now() / 1000);
        return timeNow + expiresIn;
    }
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    const isBrowser = () => typeof document !== 'undefined';
    const localStorageWriteTests = {
        tested: false,
        writable: false,
    };
    /**
     * Checks whether localStorage is supported on this browser.
     */
    const supportsLocalStorage = () => {
        if (!isBrowser()) {
            return false;
        }
        try {
            if (typeof globalThis.localStorage !== 'object') {
                return false;
            }
        }
        catch (e) {
            // DOM exception when accessing `localStorage`
            return false;
        }
        if (localStorageWriteTests.tested) {
            return localStorageWriteTests.writable;
        }
        const randomKey = `lswt-${Math.random()}${Math.random()}`;
        try {
            globalThis.localStorage.setItem(randomKey, randomKey);
            globalThis.localStorage.removeItem(randomKey);
            localStorageWriteTests.tested = true;
            localStorageWriteTests.writable = true;
        }
        catch (e) {
            // localStorage can't be written to
            // https://www.chromium.org/for-testers/bug-reporting-guidelines/uncaught-securityerror-failed-to-read-the-localstorage-property-from-window-access-is-denied-for-this-document
            localStorageWriteTests.tested = true;
            localStorageWriteTests.writable = false;
        }
        return localStorageWriteTests.writable;
    };
    function getParameterByName(name, url) {
        var _a;
        if (!url)
            url = ((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.href) || '';
        // eslint-disable-next-line no-useless-escape
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&#]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    const resolveFetch = (customFetch) => {
        let _fetch;
        if (customFetch) {
            _fetch = customFetch;
        }
        else if (typeof fetch === 'undefined') {
            _fetch = (...args) => __awaiter$4(void 0, void 0, void 0, function* () { return yield (yield Promise.resolve().then(function () { return browserPonyfill; })).fetch(...args); });
        }
        else {
            _fetch = fetch;
        }
        return (...args) => _fetch(...args);
    };
    const looksLikeFetchResponse = (maybeResponse) => {
        return (typeof maybeResponse === 'object' &&
            maybeResponse !== null &&
            'status' in maybeResponse &&
            'ok' in maybeResponse &&
            'json' in maybeResponse &&
            typeof maybeResponse.json === 'function');
    };
    // Storage helpers
    const setItemAsync = (storage, key, data) => __awaiter$4(void 0, void 0, void 0, function* () {
        yield storage.setItem(key, JSON.stringify(data));
    });
    const getItemAsync = (storage, key) => __awaiter$4(void 0, void 0, void 0, function* () {
        const value = yield storage.getItem(key);
        if (!value) {
            return null;
        }
        try {
            return JSON.parse(value);
        }
        catch (_a) {
            return value;
        }
    });
    const removeItemAsync = (storage, key) => __awaiter$4(void 0, void 0, void 0, function* () {
        yield storage.removeItem(key);
    });
    function decodeBase64URL(value) {
        const key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let base64 = '';
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;
        value = value.replace('-', '+').replace('_', '/');
        while (i < value.length) {
            enc1 = key.indexOf(value.charAt(i++));
            enc2 = key.indexOf(value.charAt(i++));
            enc3 = key.indexOf(value.charAt(i++));
            enc4 = key.indexOf(value.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            base64 = base64 + String.fromCharCode(chr1);
            if (enc3 != 64 && chr2 != 0) {
                base64 = base64 + String.fromCharCode(chr2);
            }
            if (enc4 != 64 && chr3 != 0) {
                base64 = base64 + String.fromCharCode(chr3);
            }
        }
        return base64;
    }
    /**
     * A deferred represents some asynchronous work that is not yet finished, which
     * may or may not culminate in a value.
     * Taken from: https://github.com/mike-north/types/blob/master/src/async.ts
     */
    class Deferred {
        constructor() {
            this.promise = new Deferred.promiseConstructor((res, rej) => {
                this.resolve = res;
                this.reject = rej;
            });
        }
    }
    Deferred.promiseConstructor = Promise;
    // Taken from: https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
    function decodeJWTPayload(token) {
        // Regex checks for base64url format
        const base64UrlRegex = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}=?$|[a-z0-9_-]{2}(==)?$)$/i;
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('JWT is not valid: not a JWT structure');
        }
        if (!base64UrlRegex.test(parts[1])) {
            throw new Error('JWT is not valid: payload is not in base64url format');
        }
        const base64Url = parts[1];
        return JSON.parse(decodeBase64URL(base64Url));
    }
    /**
     * Creates a promise that resolves to null after some time.
     */
    function sleep(time) {
        return new Promise((accept) => {
            setTimeout(() => accept(null), time);
        });
    }
    /**
     * Converts the provided async function into a retryable function. Each result
     * or thrown error is sent to the isRetryable function which should return true
     * if the function should run again.
     */
    function retryable(fn, isRetryable) {
        const promise = new Promise((accept, reject) => {
            (() => __awaiter$4(this, void 0, void 0, function* () {
                for (let attempt = 0; attempt < Infinity; attempt++) {
                    try {
                        const result = yield fn(attempt);
                        if (!isRetryable(attempt, null, result)) {
                            accept(result);
                            return;
                        }
                    }
                    catch (e) {
                        if (!isRetryable(attempt, e)) {
                            reject(e);
                            return;
                        }
                    }
                }
            }))();
        });
        return promise;
    }
    function dec2hex(dec) {
        return ('0' + dec.toString(16)).substr(-2);
    }
    // Functions below taken from: https://stackoverflow.com/questions/63309409/creating-a-code-verifier-and-challenge-for-pkce-auth-on-spotify-api-in-reactjs
    function generatePKCEVerifier() {
        const verifierLength = 56;
        const array = new Uint32Array(verifierLength);
        if (typeof crypto === 'undefined') {
            const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
            const charSetLen = charSet.length;
            let verifier = '';
            for (let i = 0; i < verifierLength; i++) {
                verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
            }
            return verifier;
        }
        crypto.getRandomValues(array);
        return Array.from(array, dec2hex).join('');
    }
    function sha256(randomString) {
        return __awaiter$4(this, void 0, void 0, function* () {
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(randomString);
            const hash = yield crypto.subtle.digest('SHA-256', encodedData);
            const bytes = new Uint8Array(hash);
            return Array.from(bytes)
                .map((c) => String.fromCharCode(c))
                .join('');
        });
    }
    function base64urlencode(str) {
        return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    function generatePKCEChallenge(verifier) {
        return __awaiter$4(this, void 0, void 0, function* () {
            if (typeof crypto === 'undefined') {
                console.warn('WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.');
                return verifier;
            }
            const hashed = yield sha256(verifier);
            return base64urlencode(hashed);
        });
    }

    class AuthError extends Error {
        constructor(message, status) {
            super(message);
            this.__isAuthError = true;
            this.name = 'AuthError';
            this.status = status;
        }
    }
    function isAuthError(error) {
        return typeof error === 'object' && error !== null && '__isAuthError' in error;
    }
    class AuthApiError extends AuthError {
        constructor(message, status) {
            super(message, status);
            this.name = 'AuthApiError';
            this.status = status;
        }
        toJSON() {
            return {
                name: this.name,
                message: this.message,
                status: this.status,
            };
        }
    }
    function isAuthApiError(error) {
        return isAuthError(error) && error.name === 'AuthApiError';
    }
    class AuthUnknownError extends AuthError {
        constructor(message, originalError) {
            super(message);
            this.name = 'AuthUnknownError';
            this.originalError = originalError;
        }
    }
    class CustomAuthError extends AuthError {
        constructor(message, name, status) {
            super(message);
            this.name = name;
            this.status = status;
        }
        toJSON() {
            return {
                name: this.name,
                message: this.message,
                status: this.status,
            };
        }
    }
    class AuthSessionMissingError extends CustomAuthError {
        constructor() {
            super('Auth session missing!', 'AuthSessionMissingError', 400);
        }
    }
    class AuthInvalidTokenResponseError extends CustomAuthError {
        constructor() {
            super('Auth session or user missing', 'AuthInvalidTokenResponseError', 500);
        }
    }
    class AuthInvalidCredentialsError extends CustomAuthError {
        constructor(message) {
            super(message, 'AuthInvalidCredentialsError', 400);
        }
    }
    class AuthImplicitGrantRedirectError extends CustomAuthError {
        constructor(message, details = null) {
            super(message, 'AuthImplicitGrantRedirectError', 500);
            this.details = null;
            this.details = details;
        }
        toJSON() {
            return {
                name: this.name,
                message: this.message,
                status: this.status,
                details: this.details,
            };
        }
    }
    class AuthPKCEGrantCodeExchangeError extends CustomAuthError {
        constructor(message, details = null) {
            super(message, 'AuthPKCEGrantCodeExchangeError', 500);
            this.details = null;
            this.details = details;
        }
        toJSON() {
            return {
                name: this.name,
                message: this.message,
                status: this.status,
                details: this.details,
            };
        }
    }
    class AuthRetryableFetchError extends CustomAuthError {
        constructor(message, status) {
            super(message, 'AuthRetryableFetchError', status);
        }
    }

    var __awaiter$3 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __rest$1 = (undefined && undefined.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    const _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    const handleError = (error, reject) => __awaiter$3(void 0, void 0, void 0, function* () {
        const NETWORK_ERROR_CODES = [502, 503, 504];
        if (!looksLikeFetchResponse(error)) {
            reject(new AuthRetryableFetchError(_getErrorMessage(error), 0));
        }
        else if (NETWORK_ERROR_CODES.includes(error.status)) {
            // status in 500...599 range - server had an error, request might be retryed.
            reject(new AuthRetryableFetchError(_getErrorMessage(error), error.status));
        }
        else {
            // got a response from server that is not in the 500...599 range - should not retry
            error
                .json()
                .then((err) => {
                reject(new AuthApiError(_getErrorMessage(err), error.status || 500));
            })
                .catch((e) => {
                // not a valid json response
                reject(new AuthUnknownError(_getErrorMessage(e), e));
            });
        }
    });
    const _getRequestParams = (method, options, parameters, body) => {
        const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
        if (method === 'GET') {
            return params;
        }
        params.headers = Object.assign({ 'Content-Type': 'application/json;charset=UTF-8' }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
        return Object.assign(Object.assign({}, params), parameters);
    };
    function _request(fetcher, method, url, options) {
        var _a;
        return __awaiter$3(this, void 0, void 0, function* () {
            const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
            if (options === null || options === void 0 ? void 0 : options.jwt) {
                headers['Authorization'] = `Bearer ${options.jwt}`;
            }
            const qs = (_a = options === null || options === void 0 ? void 0 : options.query) !== null && _a !== void 0 ? _a : {};
            if (options === null || options === void 0 ? void 0 : options.redirectTo) {
                qs['redirect_to'] = options.redirectTo;
            }
            const queryString = Object.keys(qs).length ? '?' + new URLSearchParams(qs).toString() : '';
            const data = yield _handleRequest(fetcher, method, url + queryString, { headers, noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson }, {}, options === null || options === void 0 ? void 0 : options.body);
            return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : { data: Object.assign({}, data), error: null };
        });
    }
    function _handleRequest(fetcher, method, url, options, parameters, body) {
        return __awaiter$3(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fetcher(url, _getRequestParams(method, options, parameters, body))
                    .then((result) => {
                    if (!result.ok)
                        throw result;
                    if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                        return result;
                    return result.json();
                })
                    .then((data) => resolve(data))
                    .catch((error) => handleError(error, reject));
            });
        });
    }
    function _sessionResponse(data) {
        var _a;
        let session = null;
        if (hasSession(data)) {
            session = Object.assign({}, data);
            session.expires_at = expiresAt(data.expires_in);
        }
        const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
        return { data: { session, user }, error: null };
    }
    function _userResponse(data) {
        var _a;
        const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
        return { data: { user }, error: null };
    }
    function _ssoResponse(data) {
        return { data, error: null };
    }
    function _generateLinkResponse(data) {
        const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = __rest$1(data, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]);
        const properties = {
            action_link,
            email_otp,
            hashed_token,
            redirect_to,
            verification_type,
        };
        const user = Object.assign({}, rest);
        return {
            data: {
                properties,
                user,
            },
            error: null,
        };
    }
    function _noResolveJsonResponse(data) {
        return data;
    }
    /**
     * hasSession checks if the response object contains a valid session
     * @param data A response object
     * @returns true if a session is in the response
     */
    function hasSession(data) {
        return data.access_token && data.refresh_token && data.expires_in;
    }

    var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __rest = (undefined && undefined.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    class GoTrueAdminApi {
        constructor({ url = '', headers = {}, fetch, }) {
            this.url = url;
            this.headers = headers;
            this.fetch = resolveFetch(fetch);
            this.mfa = {
                listFactors: this._listFactors.bind(this),
                deleteFactor: this._deleteFactor.bind(this),
            };
        }
        /**
         * Removes a logged-in session.
         * @param jwt A valid, logged-in JWT.
         */
        signOut(jwt) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    yield _request(this.fetch, 'POST', `${this.url}/logout`, {
                        headers: this.headers,
                        jwt,
                        noResolveJson: true,
                    });
                    return { data: null, error: null };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Sends an invite link to an email address.
         * @param email The email address of the user.
         * @param options Additional options to be included when inviting.
         */
        inviteUserByEmail(email, options = {}) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    return yield _request(this.fetch, 'POST', `${this.url}/invite`, {
                        body: { email, data: options.data },
                        headers: this.headers,
                        redirectTo: options.redirectTo,
                        xform: _userResponse,
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Generates email links and OTPs to be sent via a custom email provider.
         * @param email The user's email.
         * @param options.password User password. For signup only.
         * @param options.data Optional user metadata. For signup only.
         * @param options.redirectTo The redirect url which should be appended to the generated link
         */
        generateLink(params) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const { options } = params, rest = __rest(params, ["options"]);
                    const body = Object.assign(Object.assign({}, rest), options);
                    if ('newEmail' in rest) {
                        // replace newEmail with new_email in request body
                        body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
                        delete body['newEmail'];
                    }
                    return yield _request(this.fetch, 'POST', `${this.url}/admin/generate_link`, {
                        body: body,
                        headers: this.headers,
                        xform: _generateLinkResponse,
                        redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo,
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return {
                            data: {
                                properties: null,
                                user: null,
                            },
                            error,
                        };
                    }
                    throw error;
                }
            });
        }
        // User Admin API
        /**
         * Creates a new user.
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         */
        createUser(attributes) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    return yield _request(this.fetch, 'POST', `${this.url}/admin/users`, {
                        body: attributes,
                        headers: this.headers,
                        xform: _userResponse,
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Get a list of users.
         *
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
         */
        listUsers(params) {
            var _a, _b, _c, _d, _e, _f, _g;
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const pagination = { nextPage: null, lastPage: 0, total: 0 };
                    const response = yield _request(this.fetch, 'GET', `${this.url}/admin/users`, {
                        headers: this.headers,
                        noResolveJson: true,
                        query: {
                            page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
                            per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '',
                        },
                        xform: _noResolveJsonResponse,
                    });
                    if (response.error)
                        throw response.error;
                    const users = yield response.json();
                    const total = (_e = response.headers.get('x-total-count')) !== null && _e !== void 0 ? _e : 0;
                    const links = (_g = (_f = response.headers.get('link')) === null || _f === void 0 ? void 0 : _f.split(',')) !== null && _g !== void 0 ? _g : [];
                    if (links.length > 0) {
                        links.forEach((link) => {
                            const page = parseInt(link.split(';')[0].split('=')[1].substring(0, 1));
                            const rel = JSON.parse(link.split(';')[1].split('=')[1]);
                            pagination[`${rel}Page`] = page;
                        });
                        pagination.total = parseInt(total);
                    }
                    return { data: Object.assign(Object.assign({}, users), pagination), error: null };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { users: [] }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Get user by id.
         *
         * @param uid The user's unique identifier
         *
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         */
        getUserById(uid) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    return yield _request(this.fetch, 'GET', `${this.url}/admin/users/${uid}`, {
                        headers: this.headers,
                        xform: _userResponse,
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Updates the user data.
         *
         * @param attributes The data you want to update.
         *
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         */
        updateUserById(uid, attributes) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    return yield _request(this.fetch, 'PUT', `${this.url}/admin/users/${uid}`, {
                        body: attributes,
                        headers: this.headers,
                        xform: _userResponse,
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Delete a user. Requires a `service_role` key.
         *
         * @param id The user id you want to remove.
         * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema.
         * Defaults to false for backward compatibility.
         *
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         */
        deleteUser(id, shouldSoftDelete = false) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    return yield _request(this.fetch, 'DELETE', `${this.url}/admin/users/${id}`, {
                        headers: this.headers,
                        body: {
                            should_soft_delete: shouldSoftDelete,
                        },
                        xform: _userResponse,
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null }, error };
                    }
                    throw error;
                }
            });
        }
        _listFactors(params) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const { data, error } = yield _request(this.fetch, 'GET', `${this.url}/admin/users/${params.userId}/factors`, {
                        headers: this.headers,
                        xform: (factors) => {
                            return { data: { factors }, error: null };
                        },
                    });
                    return { data, error };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        _deleteFactor(params) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield _request(this.fetch, 'DELETE', `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
                        headers: this.headers,
                    });
                    return { data, error: null };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
    }

    // Generated by genversion.
    const version = '2.30.0';

    const GOTRUE_URL = 'http://localhost:9999';
    const STORAGE_KEY = 'supabase.auth.token';
    const DEFAULT_HEADERS = { 'X-Client-Info': `gotrue-js/${version}` };
    const EXPIRY_MARGIN = 10; // in seconds

    const localStorageAdapter = {
        getItem: (key) => {
            if (!supportsLocalStorage()) {
                return null;
            }
            return globalThis.localStorage.getItem(key);
        },
        setItem: (key, value) => {
            if (!supportsLocalStorage()) {
                return;
            }
            globalThis.localStorage.setItem(key, value);
        },
        removeItem: (key) => {
            if (!supportsLocalStorage()) {
                return;
            }
            globalThis.localStorage.removeItem(key);
        },
    };

    /**
     * https://mathiasbynens.be/notes/globalthis
     */
    function polyfillGlobalThis() {
        if (typeof globalThis === 'object')
            return;
        try {
            Object.defineProperty(Object.prototype, '__magic__', {
                get: function () {
                    return this;
                },
                configurable: true,
            });
            // @ts-expect-error 'Allow access to magic'
            __magic__.globalThis = __magic__;
            // @ts-expect-error 'Allow access to magic'
            delete Object.prototype.__magic__;
        }
        catch (e) {
            if (typeof self !== 'undefined') {
                // @ts-expect-error 'Allow access to globals'
                self.globalThis = self;
            }
        }
    }

    var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    polyfillGlobalThis(); // Make "globalThis" available
    const DEFAULT_OPTIONS = {
        url: GOTRUE_URL,
        storageKey: STORAGE_KEY,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        headers: DEFAULT_HEADERS,
        flowType: 'implicit',
    };
    /** Current session will be checked for refresh at this interval. */
    const AUTO_REFRESH_TICK_DURATION = 30 * 1000;
    /**
     * A token refresh will be attempted this many ticks before the current session expires. */
    const AUTO_REFRESH_TICK_THRESHOLD = 3;
    class GoTrueClient {
        /**
         * Create a new client for use in the browser.
         */
        constructor(options) {
            var _a;
            this.stateChangeEmitters = new Map();
            this.autoRefreshTicker = null;
            this.visibilityChangedCallback = null;
            this.refreshingDeferred = null;
            /**
             * Keeps track of the async client initialization.
             * When null or not yet resolved the auth state is `unknown`
             * Once resolved the the auth state is known and it's save to call any further client methods.
             * Keep extra care to never reject or throw uncaught errors
             */
            this.initializePromise = null;
            this.detectSessionInUrl = true;
            /**
             * Used to broadcast state change events to other tabs listening.
             */
            this.broadcastChannel = null;
            const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
            this.inMemorySession = null;
            this.storageKey = settings.storageKey;
            this.autoRefreshToken = settings.autoRefreshToken;
            this.persistSession = settings.persistSession;
            this.storage = settings.storage || localStorageAdapter;
            this.admin = new GoTrueAdminApi({
                url: settings.url,
                headers: settings.headers,
                fetch: settings.fetch,
            });
            this.url = settings.url;
            this.headers = settings.headers;
            this.fetch = resolveFetch(settings.fetch);
            this.detectSessionInUrl = settings.detectSessionInUrl;
            this.flowType = settings.flowType;
            this.mfa = {
                verify: this._verify.bind(this),
                enroll: this._enroll.bind(this),
                unenroll: this._unenroll.bind(this),
                challenge: this._challenge.bind(this),
                listFactors: this._listFactors.bind(this),
                challengeAndVerify: this._challengeAndVerify.bind(this),
                getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
            };
            if (this.persistSession && this.storage === localStorageAdapter && !supportsLocalStorage()) {
                console.warn(`No storage option exists to persist the session, which may result in unexpected behavior when using auth.
        If you want to set persistSession to true, please provide a storage option or you may set persistSession to false to disable this warning.`);
            }
            if (isBrowser() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
                try {
                    this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
                }
                catch (e) {
                    console.error('Failed to create a new BroadcastChannel, multi-tab state changes will not be available', e);
                }
                (_a = this.broadcastChannel) === null || _a === void 0 ? void 0 : _a.addEventListener('message', (event) => __awaiter$1(this, void 0, void 0, function* () {
                    yield this._notifyAllSubscribers(event.data.event, event.data.session, false); // broadcast = false so we don't get an endless loop of messages
                }));
            }
            this.initialize();
        }
        /**
         * Initializes the client session either from the url or from storage.
         * This method is automatically called when instantiating the client, but should also be called
         * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
         */
        initialize() {
            if (!this.initializePromise) {
                this.initializePromise = this._initialize();
            }
            return this.initializePromise;
        }
        /**
         * IMPORTANT:
         * 1. Never throw in this method, as it is called from the constructor
         * 2. Never return a session from this method as it would be cached over
         *    the whole lifetime of the client
         */
        _initialize() {
            return __awaiter$1(this, void 0, void 0, function* () {
                if (this.initializePromise) {
                    return this.initializePromise;
                }
                try {
                    const isPKCEFlow = isBrowser() ? yield this._isPKCEFlow() : false;
                    if (isPKCEFlow || (this.detectSessionInUrl && this._isImplicitGrantFlow())) {
                        const { data, error } = yield this._getSessionFromUrl(isPKCEFlow);
                        if (error) {
                            // failed login attempt via url,
                            // remove old session as in verifyOtp, signUp and signInWith*
                            yield this._removeSession();
                            return { error };
                        }
                        const { session, redirectType } = data;
                        yield this._saveSession(session);
                        setTimeout(() => __awaiter$1(this, void 0, void 0, function* () {
                            if (redirectType === 'recovery') {
                                yield this._notifyAllSubscribers('PASSWORD_RECOVERY', session);
                            }
                            else {
                                yield this._notifyAllSubscribers('SIGNED_IN', session);
                            }
                        }), 0);
                        return { error: null };
                    }
                    // no login attempt via callback url try to recover session from storage
                    yield this._recoverAndRefresh();
                    return { error: null };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { error };
                    }
                    return {
                        error: new AuthUnknownError('Unexpected error during initialization', error),
                    };
                }
                finally {
                    yield this._handleVisibilityChange();
                }
            });
        }
        /**
         * Creates a new user.
         *
         * Be aware that if a user account exists in the system you may get back an
         * error message that attempts to hide this information from the user.
         * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
         *
         * @returns A logged-in session if the server has "autoconfirm" ON
         * @returns A user if the server has "autoconfirm" OFF
         */
        signUp(credentials) {
            var _a, _b, _c;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    yield this._removeSession();
                    let res;
                    if ('email' in credentials) {
                        const { email, password, options } = credentials;
                        let codeChallenge = null;
                        let codeChallengeMethod = null;
                        if (this.flowType === 'pkce') {
                            const codeVerifier = generatePKCEVerifier();
                            yield setItemAsync(this.storage, `${this.storageKey}-code-verifier`, codeVerifier);
                            codeChallenge = yield generatePKCEChallenge(codeVerifier);
                            codeChallengeMethod = codeVerifier === codeChallenge ? 'plain' : 's256';
                        }
                        res = yield _request(this.fetch, 'POST', `${this.url}/signup`, {
                            headers: this.headers,
                            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                            body: {
                                email,
                                password,
                                data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                                code_challenge: codeChallenge,
                                code_challenge_method: codeChallengeMethod,
                            },
                            xform: _sessionResponse,
                        });
                    }
                    else if ('phone' in credentials) {
                        const { phone, password, options } = credentials;
                        res = yield _request(this.fetch, 'POST', `${this.url}/signup`, {
                            headers: this.headers,
                            body: {
                                phone,
                                password,
                                data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
                                channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : 'sms',
                                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                            },
                            xform: _sessionResponse,
                        });
                    }
                    else {
                        throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
                    }
                    const { data, error } = res;
                    if (error || !data) {
                        return { data: { user: null, session: null }, error: error };
                    }
                    const session = data.session;
                    const user = data.user;
                    if (data.session) {
                        yield this._saveSession(data.session);
                        yield this._notifyAllSubscribers('SIGNED_IN', session);
                    }
                    return { data: { user, session }, error: null };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null, session: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Log in an existing user with an email and password or phone and password.
         *
         * Be aware that you may get back an error message that will not distinguish
         * between the cases where the account does not exist or that the
         * email/phone and password combination is wrong or that the account can only
         * be accessed via social login.
         */
        signInWithPassword(credentials) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    yield this._removeSession();
                    let res;
                    if ('email' in credentials) {
                        const { email, password, options } = credentials;
                        res = yield _request(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                            headers: this.headers,
                            body: {
                                email,
                                password,
                                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                            },
                            xform: _sessionResponse,
                        });
                    }
                    else if ('phone' in credentials) {
                        const { phone, password, options } = credentials;
                        res = yield _request(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                            headers: this.headers,
                            body: {
                                phone,
                                password,
                                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                            },
                            xform: _sessionResponse,
                        });
                    }
                    else {
                        throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
                    }
                    const { data, error } = res;
                    if (error) {
                        return { data: { user: null, session: null }, error };
                    }
                    else if (!data || !data.session || !data.user) {
                        return { data: { user: null, session: null }, error: new AuthInvalidTokenResponseError() };
                    }
                    if (data.session) {
                        yield this._saveSession(data.session);
                        yield this._notifyAllSubscribers('SIGNED_IN', data.session);
                    }
                    return { data: { user: data.user, session: data.session }, error };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null, session: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Log in an existing user via a third-party provider.
         * This method supports the PKCE flow.
         */
        signInWithOAuth(credentials) {
            var _a, _b, _c, _d;
            return __awaiter$1(this, void 0, void 0, function* () {
                yield this._removeSession();
                return yield this._handleProviderSignIn(credentials.provider, {
                    redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
                    scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
                    queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
                    skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect,
                });
            });
        }
        /**
         * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
         */
        exchangeCodeForSession(authCode) {
            return __awaiter$1(this, void 0, void 0, function* () {
                const codeVerifier = yield getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                const { data, error } = yield _request(this.fetch, 'POST', `${this.url}/token?grant_type=pkce`, {
                    headers: this.headers,
                    body: {
                        auth_code: authCode,
                        code_verifier: codeVerifier,
                    },
                    xform: _sessionResponse,
                });
                yield removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                if (error) {
                    return { data: { user: null, session: null }, error };
                }
                else if (!data || !data.session || !data.user) {
                    return { data: { user: null, session: null }, error: new AuthInvalidTokenResponseError() };
                }
                if (data.session) {
                    yield this._saveSession(data.session);
                    yield this._notifyAllSubscribers('SIGNED_IN', data.session);
                }
                return { data, error };
            });
        }
        /**
         * Allows signing in with an ID token issued by certain supported providers.
         * The ID token is verified for validity and a new session is established.
         *
         * @experimental
         */
        signInWithIdToken(credentials) {
            return __awaiter$1(this, void 0, void 0, function* () {
                yield this._removeSession();
                try {
                    const { options, provider, token, nonce } = credentials;
                    const res = yield _request(this.fetch, 'POST', `${this.url}/token?grant_type=id_token`, {
                        headers: this.headers,
                        body: {
                            provider,
                            id_token: token,
                            nonce,
                            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        },
                        xform: _sessionResponse,
                    });
                    const { data, error } = res;
                    if (error) {
                        return { data: { user: null, session: null }, error };
                    }
                    else if (!data || !data.session || !data.user) {
                        return {
                            data: { user: null, session: null },
                            error: new AuthInvalidTokenResponseError(),
                        };
                    }
                    if (data.session) {
                        yield this._saveSession(data.session);
                        yield this._notifyAllSubscribers('SIGNED_IN', data.session);
                    }
                    return { data, error };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null, session: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Log in a user using magiclink or a one-time password (OTP).
         *
         * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
         * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
         * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
         *
         * Be aware that you may get back an error message that will not distinguish
         * between the cases where the account does not exist or, that the account
         * can only be accessed via social login.
         *
         * Do note that you will need to configure a Whatsapp sender on Twilio
         * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
         * channel is not supported on other providers
         * at this time.
         * This method supports PKCE when an email is passed.
         */
        signInWithOtp(credentials) {
            var _a, _b, _c, _d, _e;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    yield this._removeSession();
                    if ('email' in credentials) {
                        const { email, options } = credentials;
                        let codeChallenge = null;
                        let codeChallengeMethod = null;
                        if (this.flowType === 'pkce') {
                            const codeVerifier = generatePKCEVerifier();
                            yield setItemAsync(this.storage, `${this.storageKey}-code-verifier`, codeVerifier);
                            codeChallenge = yield generatePKCEChallenge(codeVerifier);
                            codeChallengeMethod = codeVerifier === codeChallenge ? 'plain' : 's256';
                        }
                        const { error } = yield _request(this.fetch, 'POST', `${this.url}/otp`, {
                            headers: this.headers,
                            body: {
                                email,
                                data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                                create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
                                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                                code_challenge: codeChallenge,
                                code_challenge_method: codeChallengeMethod,
                            },
                            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                        });
                        return { data: { user: null, session: null }, error };
                    }
                    if ('phone' in credentials) {
                        const { phone, options } = credentials;
                        const { error } = yield _request(this.fetch, 'POST', `${this.url}/otp`, {
                            headers: this.headers,
                            body: {
                                phone,
                                data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
                                create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
                                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                                channel: (_e = options === null || options === void 0 ? void 0 : options.channel) !== null && _e !== void 0 ? _e : 'sms',
                            },
                        });
                        return { data: { user: null, session: null }, error };
                    }
                    throw new AuthInvalidCredentialsError('You must provide either an email or phone number.');
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null, session: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Log in a user given a User supplied OTP received via mobile.
         */
        verifyOtp(params) {
            var _a, _b;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    if (params.type !== 'email_change' && params.type !== 'phone_change') {
                        // we don't want to remove the authenticated session if the user is performing an email_change or phone_change verification
                        yield this._removeSession();
                    }
                    const { data, error } = yield _request(this.fetch, 'POST', `${this.url}/verify`, {
                        headers: this.headers,
                        body: Object.assign(Object.assign({}, params), { gotrue_meta_security: { captcha_token: (_a = params.options) === null || _a === void 0 ? void 0 : _a.captchaToken } }),
                        redirectTo: (_b = params.options) === null || _b === void 0 ? void 0 : _b.redirectTo,
                        xform: _sessionResponse,
                    });
                    if (error) {
                        throw error;
                    }
                    if (!data) {
                        throw new Error('An error occurred on token verification.');
                    }
                    const session = data.session;
                    const user = data.user;
                    if (session === null || session === void 0 ? void 0 : session.access_token) {
                        yield this._saveSession(session);
                        yield this._notifyAllSubscribers('SIGNED_IN', session);
                    }
                    return { data: { user, session }, error: null };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null, session: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Attempts a single-sign on using an enterprise Identity Provider. A
         * successful SSO attempt will redirect the current page to the identity
         * provider authorization page. The redirect URL is implementation and SSO
         * protocol specific.
         *
         * You can use it by providing a SSO domain. Typically you can extract this
         * domain by asking users for their email address. If this domain is
         * registered on the Auth instance the redirect will use that organization's
         * currently active SSO Identity Provider for the login.
         *
         * If you have built an organization-specific login page, you can use the
         * organization's SSO Identity Provider UUID directly instead.
         */
        signInWithSSO(params) {
            var _a, _b, _c;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    yield this._removeSession();
                    return yield _request(this.fetch, 'POST', `${this.url}/sso`, {
                        body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, ('providerId' in params ? { provider_id: params.providerId } : null)), ('domain' in params ? { domain: params.domain } : null)), { redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : undefined }), (((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken)
                            ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } }
                            : null)), { skip_http_redirect: true }),
                        headers: this.headers,
                        xform: _ssoResponse,
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Sends a reauthentication OTP to the user's email or phone number.
         * Requires the user to be signed-in.
         */
        reauthenticate() {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const { data: { session }, error: sessionError, } = yield this.getSession();
                    if (sessionError)
                        throw sessionError;
                    if (!session)
                        throw new AuthSessionMissingError();
                    const { error } = yield _request(this.fetch, 'GET', `${this.url}/reauthenticate`, {
                        headers: this.headers,
                        jwt: session.access_token,
                    });
                    return { data: { user: null, session: null }, error };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null, session: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
         */
        resend(credentials) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    yield this._removeSession();
                    const endpoint = `${this.url}/resend`;
                    if ('email' in credentials) {
                        const { email, type, options } = credentials;
                        const { error } = yield _request(this.fetch, 'POST', endpoint, {
                            headers: this.headers,
                            body: {
                                email,
                                type,
                                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                            },
                        });
                        return { data: { user: null, session: null }, error };
                    }
                    else if ('phone' in credentials) {
                        const { phone, type, options } = credentials;
                        const { error } = yield _request(this.fetch, 'POST', endpoint, {
                            headers: this.headers,
                            body: {
                                phone,
                                type,
                                gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                            },
                        });
                        return { data: { user: null, session: null }, error };
                    }
                    throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a type');
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null, session: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Returns the session, refreshing it if necessary.
         * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
         */
        getSession() {
            return __awaiter$1(this, void 0, void 0, function* () {
                // make sure we've read the session from the url if there is one
                // save to just await, as long we make sure _initialize() never throws
                yield this.initializePromise;
                let currentSession = null;
                if (this.persistSession) {
                    const maybeSession = yield getItemAsync(this.storage, this.storageKey);
                    if (maybeSession !== null) {
                        if (this._isValidSession(maybeSession)) {
                            currentSession = maybeSession;
                        }
                        else {
                            yield this._removeSession();
                        }
                    }
                }
                else {
                    currentSession = this.inMemorySession;
                }
                if (!currentSession) {
                    return { data: { session: null }, error: null };
                }
                const hasExpired = currentSession.expires_at
                    ? currentSession.expires_at <= Date.now() / 1000
                    : false;
                if (!hasExpired) {
                    return { data: { session: currentSession }, error: null };
                }
                const { session, error } = yield this._callRefreshToken(currentSession.refresh_token);
                if (error) {
                    return { data: { session: null }, error };
                }
                return { data: { session }, error: null };
            });
        }
        /**
         * Gets the current user details if there is an existing session.
         * @param jwt Takes in an optional access token jwt. If no jwt is provided, getUser() will attempt to get the jwt from the current session.
         */
        getUser(jwt) {
            var _a, _b;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    if (!jwt) {
                        const { data, error } = yield this.getSession();
                        if (error) {
                            throw error;
                        }
                        // Default to Authorization header if there is no existing session
                        jwt = (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : undefined;
                    }
                    return yield _request(this.fetch, 'GET', `${this.url}/user`, {
                        headers: this.headers,
                        jwt: jwt,
                        xform: _userResponse,
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Updates user data for a logged in user.
         */
        updateUser(attributes, options = {}) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const { data: sessionData, error: sessionError } = yield this.getSession();
                    if (sessionError) {
                        throw sessionError;
                    }
                    if (!sessionData.session) {
                        throw new AuthSessionMissingError();
                    }
                    const session = sessionData.session;
                    const { data, error: userError } = yield _request(this.fetch, 'PUT', `${this.url}/user`, {
                        headers: this.headers,
                        redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                        body: attributes,
                        jwt: session.access_token,
                        xform: _userResponse,
                    });
                    if (userError)
                        throw userError;
                    session.user = data.user;
                    yield this._saveSession(session);
                    yield this._notifyAllSubscribers('USER_UPDATED', session);
                    return { data: { user: session.user }, error: null };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Decodes a JWT (without performing any validation).
         */
        _decodeJWT(jwt) {
            return decodeJWTPayload(jwt);
        }
        /**
         * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
         * If the refresh token or access token in the current session is invalid, an error will be thrown.
         * @param currentSession The current session that minimally contains an access token and refresh token.
         */
        setSession(currentSession) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    if (!currentSession.access_token || !currentSession.refresh_token) {
                        throw new AuthSessionMissingError();
                    }
                    const timeNow = Date.now() / 1000;
                    let expiresAt = timeNow;
                    let hasExpired = true;
                    let session = null;
                    const payload = decodeJWTPayload(currentSession.access_token);
                    if (payload.exp) {
                        expiresAt = payload.exp;
                        hasExpired = expiresAt <= timeNow;
                    }
                    if (hasExpired) {
                        const { session: refreshedSession, error } = yield this._callRefreshToken(currentSession.refresh_token);
                        if (error) {
                            return { data: { user: null, session: null }, error: error };
                        }
                        if (!refreshedSession) {
                            return { data: { user: null, session: null }, error: null };
                        }
                        session = refreshedSession;
                    }
                    else {
                        const { data, error } = yield this.getUser(currentSession.access_token);
                        if (error) {
                            throw error;
                        }
                        session = {
                            access_token: currentSession.access_token,
                            refresh_token: currentSession.refresh_token,
                            user: data.user,
                            token_type: 'bearer',
                            expires_in: expiresAt - timeNow,
                            expires_at: expiresAt,
                        };
                        yield this._saveSession(session);
                        yield this._notifyAllSubscribers('SIGNED_IN', session);
                    }
                    return { data: { user: session.user, session }, error: null };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { session: null, user: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Returns a new session, regardless of expiry status.
         * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
         * If the current session's refresh token is invalid, an error will be thrown.
         * @param currentSession The current session. If passed in, it must contain a refresh token.
         */
        refreshSession(currentSession) {
            var _a;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    if (!currentSession) {
                        const { data, error } = yield this.getSession();
                        if (error) {
                            throw error;
                        }
                        currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : undefined;
                    }
                    if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
                        throw new AuthSessionMissingError();
                    }
                    const { session, error } = yield this._callRefreshToken(currentSession.refresh_token);
                    if (error) {
                        return { data: { user: null, session: null }, error: error };
                    }
                    if (!session) {
                        return { data: { user: null, session: null }, error: null };
                    }
                    return { data: { user: session.user, session }, error: null };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { user: null, session: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Gets the session data from a URL string
         */
        _getSessionFromUrl(isPKCEFlow) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    if (!isBrowser())
                        throw new AuthImplicitGrantRedirectError('No browser detected.');
                    if (this.flowType === 'implicit' && !this._isImplicitGrantFlow()) {
                        throw new AuthImplicitGrantRedirectError('Not a valid implicit grant flow url.');
                    }
                    else if (this.flowType == 'pkce' && !isPKCEFlow) {
                        throw new AuthPKCEGrantCodeExchangeError('Not a valid PKCE flow url.');
                    }
                    if (isPKCEFlow) {
                        const authCode = getParameterByName('code');
                        if (!authCode)
                            throw new AuthPKCEGrantCodeExchangeError('No code detected.');
                        const { data, error } = yield this.exchangeCodeForSession(authCode);
                        if (error)
                            throw error;
                        if (!data.session)
                            throw new AuthPKCEGrantCodeExchangeError('No session detected.');
                        let url = new URL(window.location.href);
                        url.searchParams.delete('code');
                        window.history.replaceState(window.history.state, '', url.toString());
                        return { data: { session: data.session, redirectType: null }, error: null };
                    }
                    const error_description = getParameterByName('error_description');
                    if (error_description) {
                        const error_code = getParameterByName('error_code');
                        if (!error_code)
                            throw new AuthImplicitGrantRedirectError('No error_code detected.');
                        const error = getParameterByName('error');
                        if (!error)
                            throw new AuthImplicitGrantRedirectError('No error detected.');
                        throw new AuthImplicitGrantRedirectError(error_description, { error, code: error_code });
                    }
                    const provider_token = getParameterByName('provider_token');
                    const provider_refresh_token = getParameterByName('provider_refresh_token');
                    const access_token = getParameterByName('access_token');
                    if (!access_token)
                        throw new AuthImplicitGrantRedirectError('No access_token detected.');
                    const expires_in = getParameterByName('expires_in');
                    if (!expires_in)
                        throw new AuthImplicitGrantRedirectError('No expires_in detected.');
                    const refresh_token = getParameterByName('refresh_token');
                    if (!refresh_token)
                        throw new AuthImplicitGrantRedirectError('No refresh_token detected.');
                    const token_type = getParameterByName('token_type');
                    if (!token_type)
                        throw new AuthImplicitGrantRedirectError('No token_type detected.');
                    const timeNow = Math.round(Date.now() / 1000);
                    const expires_at = timeNow + parseInt(expires_in);
                    const { data, error } = yield this.getUser(access_token);
                    if (error)
                        throw error;
                    const user = data.user;
                    const session = {
                        provider_token,
                        provider_refresh_token,
                        access_token,
                        expires_in: parseInt(expires_in),
                        expires_at,
                        refresh_token,
                        token_type,
                        user,
                    };
                    const redirectType = getParameterByName('type');
                    // Remove tokens from URL
                    window.location.hash = '';
                    return { data: { session, redirectType }, error: null };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { session: null, redirectType: null }, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
         */
        _isImplicitGrantFlow() {
            return (isBrowser() &&
                (Boolean(getParameterByName('access_token')) ||
                    Boolean(getParameterByName('error_description'))));
        }
        /**
         * Checks if the current URL and backing storage contain parameters given by a PKCE flow
         */
        _isPKCEFlow() {
            return __awaiter$1(this, void 0, void 0, function* () {
                const currentStorageContent = yield getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                return Boolean(getParameterByName('code')) && Boolean(currentStorageContent);
            });
        }
        /**
         * Inside a browser context, `signOut()` will remove the logged in user from the browser session
         * and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
         *
         * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
         * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
         */
        signOut() {
            var _a;
            return __awaiter$1(this, void 0, void 0, function* () {
                const { data, error: sessionError } = yield this.getSession();
                if (sessionError) {
                    return { error: sessionError };
                }
                const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
                if (accessToken) {
                    const { error } = yield this.admin.signOut(accessToken);
                    if (error) {
                        // ignore 404s since user might not exist anymore
                        // ignore 401s since an invalid or expired JWT should sign out the current session
                        if (!(isAuthApiError(error) && (error.status === 404 || error.status === 401))) {
                            return { error };
                        }
                    }
                }
                yield this._removeSession();
                yield removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                yield this._notifyAllSubscribers('SIGNED_OUT', null);
                return { error: null };
            });
        }
        /**
         * Receive a notification every time an auth event happens.
         * @param callback A callback function to be invoked when an auth event happens.
         */
        onAuthStateChange(callback) {
            const id = uuid();
            const subscription = {
                id,
                callback,
                unsubscribe: () => {
                    this.stateChangeEmitters.delete(id);
                },
            };
            this.stateChangeEmitters.set(id, subscription);
            this.emitInitialSession(id);
            return { data: { subscription } };
        }
        emitInitialSession(id) {
            var _a, _b;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const { data: { session }, error, } = yield this.getSession();
                    if (error)
                        throw error;
                    yield ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0 ? void 0 : _a.callback('INITIAL_SESSION', session));
                }
                catch (err) {
                    yield ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback('INITIAL_SESSION', null));
                    console.error(err);
                }
            });
        }
        /**
         * Sends a password reset request to an email address.
         * This method supports the PKCE flow.
         * @param email The email address of the user.
         * @param options.redirectTo The URL to send the user to after they click the password reset link.
         * @param options.captchaToken Verification token received when the user completes the captcha on the site.
         */
        resetPasswordForEmail(email, options = {}) {
            return __awaiter$1(this, void 0, void 0, function* () {
                let codeChallenge = null;
                let codeChallengeMethod = null;
                if (this.flowType === 'pkce') {
                    const codeVerifier = generatePKCEVerifier();
                    yield setItemAsync(this.storage, `${this.storageKey}-code-verifier`, codeVerifier);
                    codeChallenge = yield generatePKCEChallenge(codeVerifier);
                    codeChallengeMethod = codeVerifier === codeChallenge ? 'plain' : 's256';
                }
                try {
                    return yield _request(this.fetch, 'POST', `${this.url}/recover`, {
                        body: {
                            email,
                            code_challenge: codeChallenge,
                            code_challenge_method: codeChallengeMethod,
                            gotrue_meta_security: { captcha_token: options.captchaToken },
                        },
                        headers: this.headers,
                        redirectTo: options.redirectTo,
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * Generates a new JWT.
         * @param refreshToken A valid refresh token that was returned on login.
         */
        _refreshAccessToken(refreshToken) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const startedAt = Date.now();
                    // will attempt to refresh the token with exponential backoff
                    return yield retryable((attempt) => __awaiter$1(this, void 0, void 0, function* () {
                        yield sleep(attempt * 200); // 0, 200, 400, 800, ...
                        return yield _request(this.fetch, 'POST', `${this.url}/token?grant_type=refresh_token`, {
                            body: { refresh_token: refreshToken },
                            headers: this.headers,
                            xform: _sessionResponse,
                        });
                    }), (attempt, _, result) => result &&
                        result.error &&
                        result.error instanceof AuthRetryableFetchError &&
                        // retryable only if the request can be sent before the backoff overflows the tick duration
                        Date.now() + (attempt + 1) * 200 - startedAt < AUTO_REFRESH_TICK_DURATION);
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: { session: null, user: null }, error };
                    }
                    throw error;
                }
            });
        }
        _isValidSession(maybeSession) {
            const isValidSession = typeof maybeSession === 'object' &&
                maybeSession !== null &&
                'access_token' in maybeSession &&
                'refresh_token' in maybeSession &&
                'expires_at' in maybeSession;
            return isValidSession;
        }
        _handleProviderSignIn(provider, options) {
            return __awaiter$1(this, void 0, void 0, function* () {
                const url = yield this._getUrlForProvider(provider, {
                    redirectTo: options.redirectTo,
                    scopes: options.scopes,
                    queryParams: options.queryParams,
                });
                // try to open on the browser
                if (isBrowser() && !options.skipBrowserRedirect) {
                    window.location.assign(url);
                }
                return { data: { provider, url }, error: null };
            });
        }
        /**
         * Recovers the session from LocalStorage and refreshes
         * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
         */
        _recoverAndRefresh() {
            var _a;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const currentSession = yield getItemAsync(this.storage, this.storageKey);
                    if (!this._isValidSession(currentSession)) {
                        if (currentSession !== null) {
                            yield this._removeSession();
                        }
                        return;
                    }
                    const timeNow = Math.round(Date.now() / 1000);
                    if (((_a = currentSession.expires_at) !== null && _a !== void 0 ? _a : Infinity) < timeNow + EXPIRY_MARGIN) {
                        if (this.autoRefreshToken && currentSession.refresh_token) {
                            const { error } = yield this._callRefreshToken(currentSession.refresh_token);
                            if (error) {
                                console.log(error.message);
                                yield this._removeSession();
                            }
                        }
                    }
                    else {
                        if (this.persistSession) {
                            yield this._saveSession(currentSession);
                        }
                        yield this._notifyAllSubscribers('SIGNED_IN', currentSession);
                    }
                }
                catch (err) {
                    console.error(err);
                    return;
                }
            });
        }
        _callRefreshToken(refreshToken) {
            var _a, _b;
            return __awaiter$1(this, void 0, void 0, function* () {
                // refreshing is already in progress
                if (this.refreshingDeferred) {
                    return this.refreshingDeferred.promise;
                }
                try {
                    this.refreshingDeferred = new Deferred();
                    if (!refreshToken) {
                        throw new AuthSessionMissingError();
                    }
                    const { data, error } = yield this._refreshAccessToken(refreshToken);
                    if (error)
                        throw error;
                    if (!data.session)
                        throw new AuthSessionMissingError();
                    yield this._saveSession(data.session);
                    yield this._notifyAllSubscribers('TOKEN_REFRESHED', data.session);
                    const result = { session: data.session, error: null };
                    this.refreshingDeferred.resolve(result);
                    return result;
                }
                catch (error) {
                    if (isAuthError(error)) {
                        const result = { session: null, error };
                        (_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result);
                        return result;
                    }
                    (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
                    throw error;
                }
                finally {
                    this.refreshingDeferred = null;
                }
            });
        }
        _notifyAllSubscribers(event, session, broadcast = true) {
            return __awaiter$1(this, void 0, void 0, function* () {
                if (this.broadcastChannel && broadcast) {
                    this.broadcastChannel.postMessage({ event, session });
                }
                const errors = [];
                const promises = Array.from(this.stateChangeEmitters.values()).map((x) => __awaiter$1(this, void 0, void 0, function* () {
                    try {
                        yield x.callback(event, session);
                    }
                    catch (e) {
                        errors.push(e);
                    }
                }));
                yield Promise.all(promises);
                if (errors.length > 0) {
                    for (let i = 0; i < errors.length; i += 1) {
                        console.error(errors[i]);
                    }
                    throw errors[0];
                }
            });
        }
        /**
         * set currentSession and currentUser
         * process to _startAutoRefreshToken if possible
         */
        _saveSession(session) {
            return __awaiter$1(this, void 0, void 0, function* () {
                if (!this.persistSession) {
                    this.inMemorySession = session;
                }
                if (this.persistSession && session.expires_at) {
                    yield this._persistSession(session);
                }
            });
        }
        _persistSession(currentSession) {
            return setItemAsync(this.storage, this.storageKey, currentSession);
        }
        _removeSession() {
            return __awaiter$1(this, void 0, void 0, function* () {
                if (this.persistSession) {
                    yield removeItemAsync(this.storage, this.storageKey);
                }
                else {
                    this.inMemorySession = null;
                }
            });
        }
        /**
         * Removes any registered visibilitychange callback.
         *
         * {@see #startAutoRefresh}
         * {@see #stopAutoRefresh}
         */
        _removeVisibilityChangedCallback() {
            const callback = this.visibilityChangedCallback;
            this.visibilityChangedCallback = null;
            try {
                if (callback && isBrowser() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) {
                    window.removeEventListener('visibilitychange', callback);
                }
            }
            catch (e) {
                console.error('removing visibilitychange callback failed', e);
            }
        }
        /**
         * This is the private implementation of {@link #startAutoRefresh}. Use this
         * within the library.
         */
        _startAutoRefresh() {
            return __awaiter$1(this, void 0, void 0, function* () {
                yield this._stopAutoRefresh();
                const ticker = setInterval(() => this._autoRefreshTokenTick(), AUTO_REFRESH_TICK_DURATION);
                this.autoRefreshTicker = ticker;
                if (ticker && typeof ticker === 'object' && typeof ticker.unref === 'function') {
                    // ticker is a NodeJS Timeout object that has an `unref` method
                    // https://nodejs.org/api/timers.html#timeoutunref
                    // When auto refresh is used in NodeJS (like for testing) the
                    // `setInterval` is preventing the process from being marked as
                    // finished and tests run endlessly. This can be prevented by calling
                    // `unref()` on the returned object.
                    ticker.unref();
                    // @ts-ignore
                }
                else if (typeof Deno !== 'undefined' && typeof Deno.unrefTimer === 'function') {
                    // similar like for NodeJS, but with the Deno API
                    // https://deno.land/api@latest?unstable&s=Deno.unrefTimer
                    // @ts-ignore
                    Deno.unrefTimer(ticker);
                }
                // run the tick immediately
                yield this._autoRefreshTokenTick();
            });
        }
        /**
         * This is the private implementation of {@link #stopAutoRefresh}. Use this
         * within the library.
         */
        _stopAutoRefresh() {
            return __awaiter$1(this, void 0, void 0, function* () {
                const ticker = this.autoRefreshTicker;
                this.autoRefreshTicker = null;
                if (ticker) {
                    clearInterval(ticker);
                }
            });
        }
        /**
         * Starts an auto-refresh process in the background. The session is checked
         * every few seconds. Close to the time of expiration a process is started to
         * refresh the session. If refreshing fails it will be retried for as long as
         * necessary.
         *
         * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
         * to call this function, it will be called for you.
         *
         * On browsers the refresh process works only when the tab/window is in the
         * foreground to conserve resources as well as prevent race conditions and
         * flooding auth with requests. If you call this method any managed
         * visibility change callback will be removed and you must manage visibility
         * changes on your own.
         *
         * On non-browser platforms the refresh process works *continuously* in the
         * background, which may not be desirable. You should hook into your
         * platform's foreground indication mechanism and call these methods
         * appropriately to conserve resources.
         *
         * {@see #stopAutoRefresh}
         */
        startAutoRefresh() {
            return __awaiter$1(this, void 0, void 0, function* () {
                this._removeVisibilityChangedCallback();
                yield this._startAutoRefresh();
            });
        }
        /**
         * Stops an active auto refresh process running in the background (if any).
         *
         * If you call this method any managed visibility change callback will be
         * removed and you must manage visibility changes on your own.
         *
         * See {@link #startAutoRefresh} for more details.
         */
        stopAutoRefresh() {
            return __awaiter$1(this, void 0, void 0, function* () {
                this._removeVisibilityChangedCallback();
                yield this._stopAutoRefresh();
            });
        }
        /**
         * Runs the auto refresh token tick.
         */
        _autoRefreshTokenTick() {
            return __awaiter$1(this, void 0, void 0, function* () {
                const now = Date.now();
                try {
                    const { data: { session }, } = yield this.getSession();
                    if (!session || !session.refresh_token || !session.expires_at) {
                        return;
                    }
                    // session will expire in this many ticks (or has already expired if <= 0)
                    const expiresInTicks = Math.floor((session.expires_at * 1000 - now) / AUTO_REFRESH_TICK_DURATION);
                    if (expiresInTicks < AUTO_REFRESH_TICK_THRESHOLD) {
                        yield this._callRefreshToken(session.refresh_token);
                    }
                }
                catch (e) {
                    console.error('Auto refresh tick failed with error. This is likely a transient error.', e);
                }
            });
        }
        /**
         * Registers callbacks on the browser / platform, which in-turn run
         * algorithms when the browser window/tab are in foreground. On non-browser
         * platforms it assumes always foreground.
         */
        _handleVisibilityChange() {
            return __awaiter$1(this, void 0, void 0, function* () {
                if (!isBrowser() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
                    if (this.autoRefreshToken) {
                        // in non-browser environments the refresh token ticker runs always
                        this.startAutoRefresh();
                    }
                    return false;
                }
                try {
                    this.visibilityChangedCallback = () => __awaiter$1(this, void 0, void 0, function* () { return yield this._onVisibilityChanged(false); });
                    window === null || window === void 0 ? void 0 : window.addEventListener('visibilitychange', this.visibilityChangedCallback);
                    // now immediately call the visbility changed callback to setup with the
                    // current visbility state
                    yield this._onVisibilityChanged(true); // initial call
                }
                catch (error) {
                    console.error('_handleVisibilityChange', error);
                }
            });
        }
        /**
         * Callback registered with `window.addEventListener('visibilitychange')`.
         */
        _onVisibilityChanged(isInitial) {
            return __awaiter$1(this, void 0, void 0, function* () {
                if (document.visibilityState === 'visible') {
                    if (!isInitial) {
                        // initial visibility change setup is handled in another flow under #initialize()
                        yield this.initializePromise;
                        yield this._recoverAndRefresh();
                    }
                    if (this.autoRefreshToken) {
                        // in browser environments the refresh token ticker runs only on focused tabs
                        // which prevents race conditions
                        this._startAutoRefresh();
                    }
                }
                else if (document.visibilityState === 'hidden') {
                    if (this.autoRefreshToken) {
                        this._stopAutoRefresh();
                    }
                }
            });
        }
        /**
         * Generates the relevant login URL for a third-party provider.
         * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
         * @param options.scopes A space-separated list of scopes granted to the OAuth application.
         * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
         */
        _getUrlForProvider(provider, options) {
            return __awaiter$1(this, void 0, void 0, function* () {
                const urlParams = [`provider=${encodeURIComponent(provider)}`];
                if (options === null || options === void 0 ? void 0 : options.redirectTo) {
                    urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
                }
                if (options === null || options === void 0 ? void 0 : options.scopes) {
                    urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
                }
                if (this.flowType === 'pkce') {
                    const codeVerifier = generatePKCEVerifier();
                    yield setItemAsync(this.storage, `${this.storageKey}-code-verifier`, codeVerifier);
                    const codeChallenge = yield generatePKCEChallenge(codeVerifier);
                    const codeChallengeMethod = codeVerifier === codeChallenge ? 'plain' : 's256';
                    const flowParams = new URLSearchParams({
                        code_challenge: `${encodeURIComponent(codeChallenge)}`,
                        code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`,
                    });
                    urlParams.push(flowParams.toString());
                }
                if (options === null || options === void 0 ? void 0 : options.queryParams) {
                    const query = new URLSearchParams(options.queryParams);
                    urlParams.push(query.toString());
                }
                return `${this.url}/authorize?${urlParams.join('&')}`;
            });
        }
        _unenroll(params) {
            var _a;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const { data: sessionData, error: sessionError } = yield this.getSession();
                    if (sessionError) {
                        return { data: null, error: sessionError };
                    }
                    return yield _request(this.fetch, 'DELETE', `${this.url}/factors/${params.factorId}`, {
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * {@see GoTrueMFAApi#enroll}
         */
        _enroll(params) {
            var _a, _b;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const { data: sessionData, error: sessionError } = yield this.getSession();
                    if (sessionError) {
                        return { data: null, error: sessionError };
                    }
                    const { data, error } = yield _request(this.fetch, 'POST', `${this.url}/factors`, {
                        body: {
                            friendly_name: params.friendlyName,
                            factor_type: params.factorType,
                            issuer: params.issuer,
                        },
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                    });
                    if (error) {
                        return { data: null, error };
                    }
                    if ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code) {
                        data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
                    }
                    return { data, error: null };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * {@see GoTrueMFAApi#verify}
         */
        _verify(params) {
            var _a;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const { data: sessionData, error: sessionError } = yield this.getSession();
                    if (sessionError) {
                        return { data: null, error: sessionError };
                    }
                    const { data, error } = yield _request(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/verify`, {
                        body: { code: params.code, challenge_id: params.challengeId },
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                    });
                    if (error) {
                        return { data: null, error };
                    }
                    yield this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1000) + data.expires_in }, data));
                    yield this._notifyAllSubscribers('MFA_CHALLENGE_VERIFIED', data);
                    return { data, error };
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * {@see GoTrueMFAApi#challenge}
         */
        _challenge(params) {
            var _a;
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const { data: sessionData, error: sessionError } = yield this.getSession();
                    if (sessionError) {
                        return { data: null, error: sessionError };
                    }
                    return yield _request(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/challenge`, {
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                    });
                }
                catch (error) {
                    if (isAuthError(error)) {
                        return { data: null, error };
                    }
                    throw error;
                }
            });
        }
        /**
         * {@see GoTrueMFAApi#challengeAndVerify}
         */
        _challengeAndVerify(params) {
            return __awaiter$1(this, void 0, void 0, function* () {
                const { data: challengeData, error: challengeError } = yield this._challenge({
                    factorId: params.factorId,
                });
                if (challengeError) {
                    return { data: null, error: challengeError };
                }
                return yield this._verify({
                    factorId: params.factorId,
                    challengeId: challengeData.id,
                    code: params.code,
                });
            });
        }
        /**
         * {@see GoTrueMFAApi#listFactors}
         */
        _listFactors() {
            return __awaiter$1(this, void 0, void 0, function* () {
                const { data: { user }, error: userError, } = yield this.getUser();
                if (userError) {
                    return { data: null, error: userError };
                }
                const factors = (user === null || user === void 0 ? void 0 : user.factors) || [];
                const totp = factors.filter((factor) => factor.factor_type === 'totp' && factor.status === 'verified');
                return {
                    data: {
                        all: factors,
                        totp,
                    },
                    error: null,
                };
            });
        }
        /**
         * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
         */
        _getAuthenticatorAssuranceLevel() {
            var _a, _b;
            return __awaiter$1(this, void 0, void 0, function* () {
                const { data: { session }, error: sessionError, } = yield this.getSession();
                if (sessionError) {
                    return { data: null, error: sessionError };
                }
                if (!session) {
                    return {
                        data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
                        error: null,
                    };
                }
                const payload = this._decodeJWT(session.access_token);
                let currentLevel = null;
                if (payload.aal) {
                    currentLevel = payload.aal;
                }
                let nextLevel = currentLevel;
                const verifiedFactors = (_b = (_a = session.user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor) => factor.status === 'verified')) !== null && _b !== void 0 ? _b : [];
                if (verifiedFactors.length > 0) {
                    nextLevel = 'aal2';
                }
                const currentAuthenticationMethods = payload.amr || [];
                return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null };
            });
        }
    }

    class SupabaseAuthClient extends GoTrueClient {
        constructor(options) {
            super(options);
        }
    }

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const DEFAULT_GLOBAL_OPTIONS = {
        headers: DEFAULT_HEADERS$1,
    };
    const DEFAULT_DB_OPTIONS = {
        schema: 'public',
    };
    const DEFAULT_AUTH_OPTIONS = {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
    };
    const DEFAULT_REALTIME_OPTIONS = {};
    /**
     * Supabase Client.
     *
     * An isomorphic Javascript client for interacting with Postgres.
     */
    class SupabaseClient {
        /**
         * Create a new client for use in the browser.
         * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
         * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
         * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
         * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
         * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
         * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
         * @param options.realtime Options passed along to realtime-js constructor.
         * @param options.global.fetch A custom fetch implementation.
         * @param options.global.headers Any additional headers to send with each network request.
         */
        constructor(supabaseUrl, supabaseKey, options) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            this.supabaseUrl = supabaseUrl;
            this.supabaseKey = supabaseKey;
            if (!supabaseUrl)
                throw new Error('supabaseUrl is required.');
            if (!supabaseKey)
                throw new Error('supabaseKey is required.');
            const _supabaseUrl = stripTrailingSlash(supabaseUrl);
            this.realtimeUrl = `${_supabaseUrl}/realtime/v1`.replace(/^http/i, 'ws');
            this.authUrl = `${_supabaseUrl}/auth/v1`;
            this.storageUrl = `${_supabaseUrl}/storage/v1`;
            this.functionsUrl = `${_supabaseUrl}/functions/v1`;
            // default storage key uses the supabase project ref as a namespace
            const defaultStorageKey = `sb-${new URL(this.authUrl).hostname.split('.')[0]}-auth-token`;
            const DEFAULTS = {
                db: DEFAULT_DB_OPTIONS,
                realtime: DEFAULT_REALTIME_OPTIONS,
                auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), { storageKey: defaultStorageKey }),
                global: DEFAULT_GLOBAL_OPTIONS,
            };
            const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
            this.storageKey = (_b = (_a = settings.auth) === null || _a === void 0 ? void 0 : _a.storageKey) !== null && _b !== void 0 ? _b : '';
            this.headers = (_d = (_c = settings.global) === null || _c === void 0 ? void 0 : _c.headers) !== null && _d !== void 0 ? _d : {};
            this.auth = this._initSupabaseAuthClient((_e = settings.auth) !== null && _e !== void 0 ? _e : {}, this.headers, (_f = settings.global) === null || _f === void 0 ? void 0 : _f.fetch);
            this.fetch = fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), (_g = settings.global) === null || _g === void 0 ? void 0 : _g.fetch);
            this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers }, settings.realtime));
            this.rest = new PostgrestClient(`${_supabaseUrl}/rest/v1`, {
                headers: this.headers,
                schema: (_h = settings.db) === null || _h === void 0 ? void 0 : _h.schema,
                fetch: this.fetch,
            });
            this._listenForAuthEvents();
        }
        /**
         * Supabase Functions allows you to deploy and invoke edge functions.
         */
        get functions() {
            return new FunctionsClient(this.functionsUrl, {
                headers: this.headers,
                customFetch: this.fetch,
            });
        }
        /**
         * Supabase Storage allows you to manage user-generated content, such as photos or videos.
         */
        get storage() {
            return new StorageClient(this.storageUrl, this.headers, this.fetch);
        }
        /**
         * Perform a query on a table or a view.
         *
         * @param relation - The table or view name to query
         */
        from(relation) {
            return this.rest.from(relation);
        }
        /**
         * Perform a function call.
         *
         * @param fn - The function name to call
         * @param args - The arguments to pass to the function call
         * @param options - Named parameters
         * @param options.head - When set to `true`, `data` will not be returned.
         * Useful if you only need the count.
         * @param options.count - Count algorithm to use to count rows returned by the
         * function. Only applicable for [set-returning
         * functions](https://www.postgresql.org/docs/current/functions-srf.html).
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        rpc(fn, args = {}, options) {
            return this.rest.rpc(fn, args, options);
        }
        /**
         * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
         *
         * @param {string} name - The name of the Realtime channel.
         * @param {Object} opts - The options to pass to the Realtime channel.
         *
         */
        channel(name, opts = { config: {} }) {
            return this.realtime.channel(name, opts);
        }
        /**
         * Returns all Realtime channels.
         */
        getChannels() {
            return this.realtime.getChannels();
        }
        /**
         * Unsubscribes and removes Realtime channel from Realtime client.
         *
         * @param {RealtimeChannel} channel - The name of the Realtime channel.
         *
         */
        removeChannel(channel) {
            return this.realtime.removeChannel(channel);
        }
        /**
         * Unsubscribes and removes all Realtime channels from Realtime client.
         */
        removeAllChannels() {
            return this.realtime.removeAllChannels();
        }
        _getAccessToken() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                const { data } = yield this.auth.getSession();
                return (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : null;
            });
        }
        _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, storageKey, flowType, }, headers, fetch) {
            const authHeaders = {
                Authorization: `Bearer ${this.supabaseKey}`,
                apikey: `${this.supabaseKey}`,
            };
            return new SupabaseAuthClient({
                url: this.authUrl,
                headers: Object.assign(Object.assign({}, authHeaders), headers),
                storageKey: storageKey,
                autoRefreshToken,
                persistSession,
                detectSessionInUrl,
                storage,
                flowType,
                fetch,
            });
        }
        _initRealtimeClient(options) {
            return new RealtimeClient(this.realtimeUrl, Object.assign(Object.assign({}, options), { params: Object.assign({ apikey: this.supabaseKey }, options === null || options === void 0 ? void 0 : options.params) }));
        }
        _listenForAuthEvents() {
            let data = this.auth.onAuthStateChange((event, session) => {
                this._handleTokenChanged(event, session === null || session === void 0 ? void 0 : session.access_token, 'CLIENT');
            });
            return data;
        }
        _handleTokenChanged(event, token, source) {
            if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
                this.changedAccessToken !== token) {
                // Token has changed
                this.realtime.setAuth(token !== null && token !== void 0 ? token : null);
                this.changedAccessToken = token;
            }
            else if (event === 'SIGNED_OUT') {
                // Token is removed
                this.realtime.setAuth(this.supabaseKey);
                if (source == 'STORAGE')
                    this.auth.signOut();
                this.changedAccessToken = undefined;
            }
        }
    }

    /**
     * Creates a new Supabase Client.
     */
    const createClient = (supabaseUrl, supabaseKey, options) => {
        return new SupabaseClient(supabaseUrl, supabaseKey, options);
    };

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        const [xValue, xUnit] = split_css_unit(x);
        const [yValue, yUnit] = split_css_unit(y);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - (od * u)}`
        };
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop$3) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$3) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop$3;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /**
     * @typedef {import('svelte').ComponentType} SvelteComponent
     */

    /**
     * @typedef {import('svelte/types/runtime/transition/index').FlyParams} FlyParams
     */

    /**
     * @typedef {Object} SvelteToastCustomComponent
     * @property {SvelteComponent} src - custom Svelte Component
     * @property {Object<string,any>} [props] - props to pass into custom component
     * @property {string} [sendIdTo] - forward toast id to prop name
     */

    /**
     * @callback SvelteToastOnPopCallback
     * @param {number} [id] - optionally get the toast id if needed
     */

    /**
     * @typedef {Object} SvelteToastOptions
     * @property {number} [id] - unique id generated for every toast
     * @property {string} [target] - container target name to send toast to
     * @property {string} [msg] - toast message
     * @property {number} [duration] - duration of progress bar tween from initial to next
     * @property {number} [initial] - initial progress bar value
     * @property {number} [next] - next progress bar value
     * @property {boolean} [pausable] - pause progress bar tween on mouse hover
     * @property {boolean} [dismissable] - allow dissmiss with close button
     * @property {boolean} [reversed] - display toasts in reverse order
     * @property {FlyParams} [intro] - toast intro fly animation settings
     * @property {Object<string,string|number>} [theme] - css var overrides
     * @property {string[]} [classes] - user-defined classes
     * @property {SvelteToastOnPopCallback} [onpop] - callback that runs on toast dismiss
     * @property {SvelteToastCustomComponent} [component] - send custom Svelte Component as a message
     * @property {number} [progress] - DEPRECATED
     */

    /** @type {SvelteToastOptions} */
    const defaults = {
      duration: 4000,
      initial: 1,
      next: 0,
      pausable: false,
      dismissable: true,
      reversed: false,
      intro: { x: 256 }
    };

    function createToast() {
      const { subscribe, update } = writable(new Array());
      /** @type {Object<string,SvelteToastOptions>} */
      const options = {};
      let count = 0;

      /** @param {any} obj */
      function _obj(obj) {
        return obj instanceof Object
      }

      function _init(target = 'default', opts = {}) {
        options[target] = opts;
        return options
      }

      /**
       * Send a new toast
       * @param {(string|SvelteToastOptions)} msg
       * @param {SvelteToastOptions} [opts]
       * @returns {number}
       */
      function push(msg, opts) {
        const param = {
          target: 'default',
          ...(_obj(msg) ? /** @type {SvelteToastOptions} */ (msg) : { ...opts, msg })
        };
        const conf = options[param.target] || {};
        const entry = {
          ...defaults,
          ...conf,
          ...param,
          theme: { ...conf.theme, ...param.theme },
          classes: [...(conf.classes || []), ...(param.classes || [])],
          id: ++count
        };
        update((n) => (entry.reversed ? [...n, entry] : [entry, ...n]));
        return count
      }

      /**
       * Remove toast(s)
       * - toast.pop() // removes the last toast
       * - toast.pop(0) // remove all toasts
       * - toast.pop(id) // removes the toast with specified `id`
       * - toast.pop({ target: 'foo' }) // remove all toasts from target `foo`
       * @param {(number|Object<'target',string>)} [id]
       */
      function pop(id) {
        update((n) => {
          if (!n.length || id === 0) return []
          // Filter function is deprecated; shim added for backward compatibility
          if (typeof id === 'function') return n.filter((i) => id(i))
          if (_obj(id))
            return n.filter(/** @type {SvelteToastOptions[]} i */ (i) => i.target !== id.target)
          const found = id || Math.max(...n.map((i) => i.id));
          return n.filter((i) => i.id !== found)
        });
      }

      /**
       * Update an existing toast
       * @param {(number|SvelteToastOptions)} id
       * @param {SvelteToastOptions} [opts]
       */
      function set(id, opts) {
        /** @type {any} */
        const param = _obj(id) ? id : { ...opts, id };
        update((n) => {
          const idx = n.findIndex((i) => i.id === param.id);
          if (idx > -1) {
            n[idx] = { ...n[idx], ...param };
          }
          return n
        });
      }

      return { subscribe, push, pop, set, _init }
    }

    const toast = createToast();

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* node_modules\.pnpm\@zerodevx+svelte-toast@0.9.3_svelte@3.59.1\node_modules\@zerodevx\svelte-toast\ToastItem.svelte generated by Svelte v3.59.1 */
    const file$2 = "node_modules\\.pnpm\\@zerodevx+svelte-toast@0.9.3_svelte@3.59.1\\node_modules\\@zerodevx\\svelte-toast\\ToastItem.svelte";

    // (97:4) {:else}
    function create_else_block$1(ctx) {
    	let html_tag;
    	let raw_value = /*item*/ ctx[0].msg + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && raw_value !== (raw_value = /*item*/ ctx[0].msg + "")) html_tag.p(raw_value);
    		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(97:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (95:4) {#if item.component}
    function create_if_block_1$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*cprops*/ ctx[2]];
    	var switch_value = /*item*/ ctx[0].component.src;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*cprops*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*cprops*/ ctx[2])])
    			: {};

    			if (dirty & /*item*/ 1 && switch_value !== (switch_value = /*item*/ ctx[0].component.src)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(95:4) {#if item.component}",
    		ctx
    	});

    	return block;
    }

    // (101:2) {#if item.dismissable}
    function create_if_block$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "_toastBtn pe svelte-95rq8t");
    			attr_dev(div, "role", "button");
    			attr_dev(div, "tabindex", "0");
    			add_location(div, file$2, 101, 4, 2263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*close*/ ctx[4], false, false, false, false),
    					listen_dev(div, "keydown", /*keydown_handler*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(101:2) {#if item.dismissable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let t1;
    	let progress_1;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[0].component) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*item*/ ctx[0].dismissable && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			progress_1 = element("progress");
    			attr_dev(div0, "role", "status");
    			attr_dev(div0, "class", "_toastMsg svelte-95rq8t");
    			toggle_class(div0, "pe", /*item*/ ctx[0].component);
    			add_location(div0, file$2, 93, 2, 2026);
    			attr_dev(progress_1, "class", "_toastBar svelte-95rq8t");
    			progress_1.value = /*$progress*/ ctx[1];
    			add_location(progress_1, file$2, 111, 2, 2492);
    			attr_dev(div1, "class", "_toastItem svelte-95rq8t");
    			toggle_class(div1, "pe", /*item*/ ctx[0].pausable);
    			add_location(div1, file$2, 85, 0, 1883);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div1, t0);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, progress_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "mouseenter", /*mouseenter_handler*/ ctx[9], false, false, false, false),
    					listen_dev(div1, "mouseleave", /*resume*/ ctx[6], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, null);
    			}

    			if (!current || dirty & /*item*/ 1) {
    				toggle_class(div0, "pe", /*item*/ ctx[0].component);
    			}

    			if (/*item*/ ctx[0].dismissable) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*$progress*/ 2) {
    				prop_dev(progress_1, "value", /*$progress*/ ctx[1]);
    			}

    			if (!current || dirty & /*item*/ 1) {
    				toggle_class(div1, "pe", /*item*/ ctx[0].pausable);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function check(prop, kind = 'undefined') {
    	return typeof prop === kind;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $progress;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToastItem', slots, []);
    	let { item } = $$props;

    	/** @type {any} */
    	let next = item.initial;

    	let prev = next;
    	let paused = false;
    	let cprops = {};

    	/** @type {any} */
    	let unlisten;

    	const progress = tweened(item.initial, { duration: item.duration, easing: identity });
    	validate_store(progress, 'progress');
    	component_subscribe($$self, progress, value => $$invalidate(1, $progress = value));

    	function close() {
    		toast.pop(item.id);
    	}

    	function autoclose() {
    		if ($progress === 1 || $progress === 0) close();
    	}

    	function pause() {
    		if (!paused && $progress !== next) {
    			progress.set($progress, { duration: 0 });
    			paused = true;
    		}
    	}

    	function resume() {
    		if (paused) {
    			const d = /** @type {any} */
    			item.duration;

    			const duration = d - d * (($progress - prev) / (next - prev));
    			progress.set(next, { duration }).then(autoclose);
    			paused = false;
    		}
    	}

    	function listen(d = document) {
    		if (check(d.hidden)) return;
    		const handler = () => d.hidden ? pause() : resume();
    		const name = 'visibilitychange';
    		d.addEventListener(name, handler);
    		unlisten = () => d.removeEventListener(name, handler);
    		handler();
    	}

    	onMount(listen);

    	onDestroy(() => {
    		if (check(item.onpop, 'function')) {
    			// @ts-ignore
    			item.onpop(item.id);
    		}

    		unlisten && unlisten();
    	});

    	$$self.$$.on_mount.push(function () {
    		if (item === undefined && !('item' in $$props || $$self.$$.bound[$$self.$$.props['item']])) {
    			console.warn("<ToastItem> was created without expected prop 'item'");
    		}
    	});

    	const writable_props = ['item'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToastItem> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = e => {
    		if (e instanceof KeyboardEvent && ['Enter', ' '].includes(e.key)) close();
    	};

    	const mouseenter_handler = () => {
    		if (item.pausable) pause();
    	};

    	$$self.$$set = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		tweened,
    		linear: identity,
    		toast,
    		item,
    		next,
    		prev,
    		paused,
    		cprops,
    		unlisten,
    		progress,
    		close,
    		autoclose,
    		pause,
    		resume,
    		check,
    		listen,
    		$progress
    	});

    	$$self.$inject_state = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('next' in $$props) $$invalidate(7, next = $$props.next);
    		if ('prev' in $$props) prev = $$props.prev;
    		if ('paused' in $$props) paused = $$props.paused;
    		if ('cprops' in $$props) $$invalidate(2, cprops = $$props.cprops);
    		if ('unlisten' in $$props) unlisten = $$props.unlisten;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*item*/ 1) {
    			// `progress` has been renamed to `next`; shim included for backward compatibility, to remove in next major
    			if (!check(item.progress)) {
    				$$invalidate(0, item.next = item.progress, item);
    			}
    		}

    		if ($$self.$$.dirty & /*next, item, $progress*/ 131) {
    			if (next !== item.next) {
    				$$invalidate(7, next = item.next);
    				prev = $progress;
    				paused = false;
    				progress.set(next).then(autoclose);
    			}
    		}

    		if ($$self.$$.dirty & /*item*/ 1) {
    			if (item.component) {
    				const { props = {}, sendIdTo } = item.component;

    				$$invalidate(2, cprops = {
    					...props,
    					...sendIdTo && { [sendIdTo]: item.id }
    				});
    			}
    		}
    	};

    	return [
    		item,
    		$progress,
    		cprops,
    		progress,
    		close,
    		pause,
    		resume,
    		next,
    		keydown_handler,
    		mouseenter_handler
    	];
    }

    class ToastItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToastItem",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get item() {
    		throw new Error("<ToastItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<ToastItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\.pnpm\@zerodevx+svelte-toast@0.9.3_svelte@3.59.1\node_modules\@zerodevx\svelte-toast\SvelteToast.svelte generated by Svelte v3.59.1 */

    const { Object: Object_1 } = globals;
    const file$1 = "node_modules\\.pnpm\\@zerodevx+svelte-toast@0.9.3_svelte@3.59.1\\node_modules\\@zerodevx\\svelte-toast\\SvelteToast.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (26:2) {#each items as item (item.id)}
    function create_each_block$1(key_1, ctx) {
    	let li;
    	let toastitem;
    	let t;
    	let li_class_value;
    	let li_style_value;
    	let li_intro;
    	let li_outro;
    	let rect;
    	let stop_animation = noop$3;
    	let current;

    	toastitem = new ToastItem({
    			props: { item: /*item*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			create_component(toastitem.$$.fragment);
    			t = space();
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*item*/ ctx[4].classes?.join(' ')) + " svelte-1u812xz"));
    			attr_dev(li, "style", li_style_value = getCss(/*item*/ ctx[4].theme));
    			add_location(li, file$1, 26, 4, 722);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(toastitem, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const toastitem_changes = {};
    			if (dirty & /*items*/ 1) toastitem_changes.item = /*item*/ ctx[4];
    			toastitem.$set(toastitem_changes);

    			if (!current || dirty & /*items*/ 1 && li_class_value !== (li_class_value = "" + (null_to_empty(/*item*/ ctx[4].classes?.join(' ')) + " svelte-1u812xz"))) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (!current || dirty & /*items*/ 1 && li_style_value !== (li_style_value = getCss(/*item*/ ctx[4].theme))) {
    				attr_dev(li, "style", li_style_value);
    			}
    		},
    		r: function measure() {
    			rect = li.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(li);
    			stop_animation();
    			add_transform(li, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(li, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toastitem.$$.fragment, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (li_outro) li_outro.end(1);
    				li_intro = create_in_transition(li, fly, /*item*/ ctx[4].intro);
    				li_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toastitem.$$.fragment, local);
    			if (li_intro) li_intro.invalidate();
    			li_outro = create_out_transition(li, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(toastitem);
    			if (detaching && li_outro) li_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(26:2) {#each items as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "_toastContainer svelte-1u812xz");
    			add_location(ul, file$1, 24, 0, 655);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items, getCss*/ 1) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, fix_and_outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getCss(theme) {
    	return theme
    	? Object.keys(theme).reduce((a, c) => `${a}${c}:${theme[c]};`, '')
    	: undefined;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $toast;
    	validate_store(toast, 'toast');
    	component_subscribe($$self, toast, $$value => $$invalidate(3, $toast = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvelteToast', slots, []);
    	let { options = {} } = $$props;
    	let { target = 'default' } = $$props;

    	/** @type {import('./stores').SvelteToastOptions[]} */
    	let items = [];

    	const writable_props = ['options', 'target'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvelteToast> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('target' in $$props) $$invalidate(2, target = $$props.target);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		flip,
    		toast,
    		ToastItem,
    		options,
    		target,
    		items,
    		getCss,
    		$toast
    	});

    	$$self.$inject_state = $$props => {
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('target' in $$props) $$invalidate(2, target = $$props.target);
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*target, options*/ 6) {
    			toast._init(target, options);
    		}

    		if ($$self.$$.dirty & /*$toast, target*/ 12) {
    			$$invalidate(0, items = $toast.filter(i => i.target === target));
    		}
    	};

    	return [items, options, target, $toast];
    }

    class SvelteToast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { options: 1, target: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvelteToast",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get options() {
    		throw new Error("<SvelteToast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<SvelteToast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get target() {
    		throw new Error("<SvelteToast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set target(value) {
    		throw new Error("<SvelteToast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\components\SideBar.svelte generated by Svelte v3.59.1 */

    const { console: console_1 } = globals;
    const file = "webviews\\components\\SideBar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (288:2) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*messages*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages, snarkdown*/ 4) {
    				each_value = /*messages*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(288:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (266:52) 
    function create_if_block_1(ctx) {
    	let div0;
    	let raw0_value = "Code Fundi 👷🏽‍♂️" + "";
    	let t0;
    	let div2;
    	let html_tag;
    	let raw1_value = "To get started, sign in / sign up below" + "";
    	let t1;
    	let form;
    	let div1;
    	let button0;
    	let t3;
    	let br0;
    	let t4;
    	let button1;
    	let t6;
    	let br1;
    	let t7;
    	let input0;
    	let t8;
    	let input1;
    	let t9;
    	let button2;
    	let t11;
    	let button3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			html_tag = new HtmlTag(false);
    			t1 = space();
    			form = element("form");
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Login with GitHub";
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Login with Google";
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			button2 = element("button");
    			button2.textContent = "Sign In";
    			t11 = space();
    			button3 = element("button");
    			button3.textContent = "Sign Up";
    			attr_dev(div0, "class", "banner svelte-1xlez4g");
    			add_location(div0, file, 266, 4, 6726);
    			html_tag.a = t1;
    			attr_dev(button0, "type", "button");
    			add_location(button0, file, 273, 10, 6937);
    			add_location(br0, file, 274, 10, 6997);
    			attr_dev(button1, "type", "button");
    			add_location(button1, file, 275, 10, 7014);
    			attr_dev(div1, "class", "banner svelte-1xlez4g");
    			add_location(div1, file, 272, 8, 6905);
    			add_location(br1, file, 277, 8, 7089);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "id", "email");
    			attr_dev(input0, "placeholder", "Email");
    			add_location(input0, file, 278, 8, 7104);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "placeholder", "Password");
    			add_location(input1, file, 280, 8, 7188);
    			attr_dev(button2, "type", "button");
    			add_location(button2, file, 282, 8, 7284);
    			attr_dev(button3, "type", "button");
    			add_location(button3, file, 283, 8, 7355);
    			add_location(form, file, 271, 6, 6889);
    			attr_dev(div2, "class", "welcome svelte-1xlez4g");
    			add_location(div2, file, 268, 4, 6797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			div0.innerHTML = raw0_value;
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			html_tag.m(raw1_value, div2);
    			append_dev(div2, t1);
    			append_dev(div2, form);
    			append_dev(form, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t3);
    			append_dev(div1, br0);
    			append_dev(div1, t4);
    			append_dev(div1, button1);
    			append_dev(form, t6);
    			append_dev(form, br1);
    			append_dev(form, t7);
    			append_dev(form, input0);
    			set_input_value(input0, /*email*/ ctx[0]);
    			append_dev(form, t8);
    			append_dev(form, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(form, t9);
    			append_dev(form, button2);
    			append_dev(form, t11);
    			append_dev(form, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(button2, "click", /*handleLogin*/ ctx[6], false, false, false, false),
    					listen_dev(button3, "click", /*handleSignup*/ ctx[5], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*email*/ 1 && input0.value !== /*email*/ ctx[0]) {
    				set_input_value(input0, /*email*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}
    		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(266:52) ",
    		ctx
    	});

    	return block;
    }

    // (260:2) {#if messages.length === 0 && session !== ""}
    function create_if_block(ctx) {
    	let div0;
    	let raw0_value = "Code Fundi 👷🏽‍♂️" + "";
    	let t;
    	let div1;
    	let raw1_value = "To get started, type in the message box below or highlight your code then right click to access the options." + "";

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "banner svelte-1xlez4g");
    			add_location(div0, file, 260, 4, 6436);
    			attr_dev(div1, "class", "welcome svelte-1xlez4g");
    			add_location(div1, file, 262, 4, 6505);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			div0.innerHTML = raw0_value;
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			div1.innerHTML = raw1_value;
    		},
    		p: noop$3,
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(260:2) {#if messages.length === 0 && session !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (299:44) 
    function create_if_block_4(ctx) {
    	let div;
    	let raw_value = t(/*message*/ ctx[15].data) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "message-response svelte-1xlez4g");
    			add_location(div, file, 299, 8, 7899);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 4 && raw_value !== (raw_value = t(/*message*/ ctx[15].data) + "")) div.innerHTML = raw_value;		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(299:44) ",
    		ctx
    	});

    	return block;
    }

    // (293:43) 
    function create_if_block_3(ctx) {
    	let div1;
    	let html_tag;
    	let raw_value = t(/*message*/ ctx[15].data) + "";
    	let t0;
    	let div0;
    	let pulse;
    	let t1;
    	let current;

    	pulse = new Pulse({
    			props: {
    				size: "20",
    				color: "#e81224",
    				unit: "px",
    				duration: "3s"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			html_tag = new HtmlTag(false);
    			t0 = space();
    			div0 = element("div");
    			create_component(pulse.$$.fragment);
    			t1 = space();
    			html_tag.a = t0;
    			attr_dev(div0, "class", "loader svelte-1xlez4g");
    			add_location(div0, file, 294, 10, 7716);
    			attr_dev(div1, "class", "message-response svelte-1xlez4g");
    			add_location(div1, file, 293, 8, 7643);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			html_tag.m(raw_value, div1);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(pulse, div0, null);
    			append_dev(div1, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*messages*/ 4) && raw_value !== (raw_value = t(/*message*/ ctx[15].data) + "")) html_tag.p(raw_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pulse.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pulse.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(pulse);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(293:43) ",
    		ctx
    	});

    	return block;
    }

    // (291:6) {#if message.type === 'Query'}
    function create_if_block_2(ctx) {
    	let div;
    	let raw_value = /*message*/ ctx[15].data + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "message svelte-1xlez4g");
    			add_location(div, file, 291, 8, 7541);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 4 && raw_value !== (raw_value = /*message*/ ctx[15].data + "")) div.innerHTML = raw_value;		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(291:6) {#if message.type === 'Query'}",
    		ctx
    	});

    	return block;
    }

    // (289:4) {#each messages as message}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3, create_if_block_4];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*message*/ ctx[15].type === 'Query') return 0;
    		if (/*message*/ ctx[15].type === 'Waiting') return 1;
    		if (/*message*/ ctx[15].type === 'Response') return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(289:4) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let sveltetoast;
    	let t0;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let div0;
    	let form;
    	let input;
    	let t2;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	sveltetoast = new SvelteToast({
    			props: {
    				options: { theme: { '--toastBarHeight': 0 } }
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*messages*/ ctx[2].length === 0 && /*session*/ ctx[4] !== "") return 0;
    		if (/*messages*/ ctx[2].length === 0 && /*session*/ ctx[4] === "") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(sveltetoast.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			if_block.c();
    			t1 = space();
    			div0 = element("div");
    			form = element("form");
    			input = element("input");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Ask a question";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "message-input svelte-1xlez4g");
    			add_location(input, file, 307, 6, 8109);
    			attr_dev(button, "class", "send-button svelte-1xlez4g");
    			add_location(button, file, 308, 6, 8184);
    			attr_dev(form, "class", "svelte-1xlez4g");
    			add_location(form, file, 306, 4, 8046);
    			attr_dev(div0, "class", "message-box svelte-1xlez4g");
    			add_location(div0, file, 305, 2, 8015);
    			attr_dev(div1, "class", "chat svelte-1xlez4g");
    			add_location(div1, file, 258, 0, 6363);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sveltetoast, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			if_blocks[current_block_type_index].m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, form);
    			append_dev(form, input);
    			set_input_value(input, /*newMessage*/ ctx[3]);
    			append_dev(form, t2);
    			append_dev(form, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[10]),
    					listen_dev(button, "click", /*askFundi*/ ctx[7], false, false, false, false),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[11]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, t1);
    			}

    			if (dirty & /*newMessage*/ 8 && input.value !== /*newMessage*/ ctx[3]) {
    				set_input_value(input, /*newMessage*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sveltetoast.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sveltetoast.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sveltetoast, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const supabaseUrl = '';
    const supabaseKey = '';
    const fundiV1 = '';
    const api_key = "";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SideBar', slots, []);
    	const supabase = createClient(supabaseUrl, supabaseKey);
    	let email = '';
    	let password = '';
    	let messages = [];
    	let newMessage = "";
    	let session = "";

    	async function handleSignup() {
    		try {
    			const { data, error } = await supabase.auth.signUp({ email, password });

    			if (error) {
    				console.error('Signup error:', error.message);
    				toast.push(`Signup error: ${error.message}`);
    				return;
    			}

    			console.log('Signup success:', data);
    			toast.push(`Signup successful`);
    		} catch(error) {
    			console.error('Signup error:', error.message);
    			toast.push(`Signup error: ${error.message}`);
    		}
    	}

    	async function handleLogin() {
    		try {
    			const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    			if (error) {
    				console.error('Login error:', error.message);
    				toast.push(`Login error: ${error.message}`);
    				return;
    			}

    			$$invalidate(4, session = data.session);
    			console.log('Login success:', data);
    			toast.push(`Login successful`);
    		} catch(error) {
    			console.error('Login error:', error.message);
    			toast.push(`Login error: ${error.message}`);
    		}
    	}

    	async function handleOAuth(provider) {
    		try {
    			const { data, error } = await supabase.auth.signInWithOAuth({ provider });

    			if (error) {
    				console.error('Login error:', error.message);
    				return;
    			}

    			console.log('Login success:', data);
    		} catch(error) {
    			console.error('Login error:', error.message);
    		}
    	}

    	function fundiAPI(message, endpoint, data) {
    		const endpointName = endpoint.charAt(0).toUpperCase() + endpoint.slice(1);

    		const messageBody = {
    			type: 'Query',
    			data: `<span style="color:#808080; font-weight: bold;">${endpointName}: </span>   ${message.value}`
    		};

    		$$invalidate(2, messages = [...messages, messageBody]);

    		// Loading message
    		const messageLoading = {
    			type: 'Waiting',
    			data: '<span style="color:#808080; font-weight: bold;">Thinking 🧠</span>'
    		};

    		$$invalidate(2, messages = [...messages, messageLoading]);

    		axios$1({
    			method: 'POST',
    			url: `${fundiV1}/v1/fundi/${endpoint}`,
    			data,
    			headers: { "Content-Type": "application/json" },
    			responseType: 'stream'
    		}).then(response => {
    			// convert response to markdown
    			response = response.data.replace(/\n/g, ' ').replace(/\t/g, '&emsp;').replace(/\r/g, ' ');

    			messages.pop();

    			const messageResponse = {
    				type: 'Response',
    				data: JSON.stringify(response)
    			};

    			$$invalidate(2, messages = [...messages, messageResponse]);
    		}).catch(error => {
    			// Handle any errors
    			console.error(error);
    		});
    	}

    	function askFundi() {
    		let data = {
    			api_key,
    			code_block: '',
    			question: newMessage
    		};

    		let message = { value: newMessage };
    		fundiAPI(message, 'ask', data);
    	}

    	onMount(() => {
    		window.addEventListener('message', event => {
    			const message = event.data; // The json data that the extension sent
    			console.log(message);
    			let data = {};

    			switch (message.type) {
    				case 'debug':
    					data = { api_key, code_block: message.value };
    					fundiAPI(message, 'debug', data);
    					break;
    				case 'ask':
    					data = { api_key, code_block: message.value };
    					fundiAPI(message, 'ask', data);
    					break;
    				case 'explain':
    					data = { api_key, code_block: message.value };
    					fundiAPI(message, 'explain', data);
    					break;
    				case 'generate':
    					data = { api_key, code_block: message.value };
    					fundiAPI(message, 'generate', data);
    					break;
    			}
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<SideBar> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	function input_input_handler() {
    		newMessage = this.value;
    		$$invalidate(3, newMessage);
    	}

    	const submit_handler = () => $$invalidate(3, newMessage = '');

    	$$self.$capture_state = () => ({
    		onMount,
    		axios: axios$1,
    		snarkdown: t,
    		Pulse,
    		createClient,
    		SvelteToast,
    		toast,
    		supabaseUrl,
    		supabaseKey,
    		supabase,
    		email,
    		password,
    		messages,
    		newMessage,
    		fundiV1,
    		api_key,
    		session,
    		handleSignup,
    		handleLogin,
    		handleOAuth,
    		fundiAPI,
    		askFundi
    	});

    	$$self.$inject_state = $$props => {
    		if ('email' in $$props) $$invalidate(0, email = $$props.email);
    		if ('password' in $$props) $$invalidate(1, password = $$props.password);
    		if ('messages' in $$props) $$invalidate(2, messages = $$props.messages);
    		if ('newMessage' in $$props) $$invalidate(3, newMessage = $$props.newMessage);
    		if ('session' in $$props) $$invalidate(4, session = $$props.session);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		email,
    		password,
    		messages,
    		newMessage,
    		session,
    		handleSignup,
    		handleLogin,
    		askFundi,
    		input0_input_handler,
    		input1_input_handler,
    		input_input_handler,
    		submit_handler
    	];
    }

    class SideBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideBar",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new SideBar({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=SideBar.js.map
