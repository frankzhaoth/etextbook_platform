import Vue from 'vue'
import Router from 'vue-router'

import Dashboard from '@/components/Dashboard'
import Login from '@/components/Login'
import SignUp from '@/components/SignUp'
import PasswordReset from '@/components/PasswordReset'
import AdminPortal from '@/components/AdminPortal'
import Textbook from '@/components/Textbook'
import Forum from '@/components/Forum'
import NewQuestion from '@/components/NewQuestion'
import Question from '@/components/Question'
import pdfTester from '@/components/pdfTester'
import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  routes: [
  	{
  		path: '*',
  		redirect: '/login'
  	},
  	{
  		path: '/',
  		redirect: '/login'
  	},
    {
    	path: '/login',
    	name: 'Login',
    	component: Login
    },
    {
    	path: '/sign-up',
    	name: 'SignUp',
    	component: SignUp
    },
    {
      path: '/password-reset',
      name: 'PasswordReset',
      component: PasswordReset
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
      	requiresAuth: true
      }
    },
    {
      path: '/adminportal',
      name: 'AdminPortal',
      component: AdminPortal,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/textbook/:textbookId',
      name: 'Textbook',
      component: Textbook,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/textbook/:textbookId/view',
      name: 'pdfTester',
      component: pdfTester,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/textbook/:textbookId/forum',
      name: 'Forum',
      component: Forum,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/textbook/:textbookId/forum/new',
      name: 'NewQuestion',
      component: NewQuestion,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/textbook/:textbookId/forum/:questionId',
      name: 'Question',
      component: Question,
      meta: {
        requiresAuth: true
      }
    },
  ]
});

router.beforeEach((to, from, next) => {
	let currentUser = firebase.auth().currentUser;
	let requiresAuth = to.matched.some(record => record.meta.requiresAuth);

	if (requiresAuth && !currentUser)
    next('login')
	else if 
    (!requiresAuth && currentUser) next('dashboard')
	else 
    next()
});

export default router