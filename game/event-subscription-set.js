export default class EventSubscriptionSet extends Set {
    match(set) {
        let match = [];
        for (let e of this) {
            if (set.has(e)) {
                match.push(e);
            }
        }
        return match;
    }
}