import {createRouter, createWebHashHistory} from 'vue-router';
import Settings from "../views/Settings.vue";
import Explorer from "../views/Explorer.vue";

const routes = [
    {
        path: '/',
        component: Settings,
        name: 'settings'
    },
    {
        path: '/explorer',
        component: Explorer,
        name: 'explorer'
    },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes
});
