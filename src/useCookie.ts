import {Ref} from 'vue';
import {useState} from "./index";
import Cookies from 'js-cookie';

const useCookie = (
    cookieName: string
): [Ref<string | null>, (newValue: string, options?: Cookies.CookieAttributes) => void, () => void] => {
    const [value, setValue] = useState<string | null>(() => Cookies.get(cookieName) || null);

    const updateCookie = (newValue: string, options?: Cookies.CookieAttributes) => {
        Cookies.set(cookieName, newValue, options);
        setValue(newValue);
    };

    const deleteCookie = () => {
        Cookies.remove(cookieName);
        setValue(null);
    };

    return [value, updateCookie, deleteCookie];
};

export default useCookie;