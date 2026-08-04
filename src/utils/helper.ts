
class Helper {
    static capitalize(str: string | undefined) {
        return str && str.charAt(0).toUpperCase() + str.slice(1);
    }
}

export default Helper