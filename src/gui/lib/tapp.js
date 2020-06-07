import htm from 'htm';

export function createContext() {
    return {
        map: {}
    }
}

export function registerTapp(fn, space) {
    return {
        ...space,
        map: {
            ...space.map,
            [fn.name]: fn
        }
    }
}

export function getHtmFormat(type, props, ...children) {
    return { type, props, children };
}

export function htmlToString(tag, ctx) {
    const children = tag.children.map(i => {
        if (typeof(i) === 'string') return i;
        if (typeof(i) === 'object') return htmlToString(i);

        throw(new Error('Unknown type found while rendering.'));
    });

    // only children
    return `<${tag.type} ...${tag.props}>${children}<${tag.type}>`;
}

export function createContext() {
    return {
        map: {}
    }
}

export function renderTapp(comp, args) {
    const ctx = createContext();
    ctx.html = htm.bind(getHtmFormat);

    const tagObject = comp({}, ctx)

    return htmlToString(tagObject, ctx)
}

// example tapps
function List(arg, ctx) {
    return ctx.html`
        <div>
            <h3>header!</h3>
            <ListItem>A</ListItem>
            <ListItem>B</ListItem>
            <ListItem>C</ListItem>
        </div>
    `;
}

function ListItem(arg, ctx) {
    return ctx.html`<b>${arg.children}</b>`;
}

renderTapp(List, tapp);