class Event {
    fireEvent(element, event) {
        if (document.createEventObject) {
            const evt = document.createEventObject();
            element.fireEvent(`on${event}`, evt);
        } else if (document.createEvent) {
            const evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, false, false);
            element.dispatchEvent(evt);
        } else {
            return false;
        }
    }

    addListener(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false)
        } else {
            element.attachEvent(`on${event}`, handler);
        }
    }

    removeListener(element, event, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(event, handler, false)
        } else {
            element.detachEvent(`on${event}`, handler);
        }
    }
}

export default new Event();
