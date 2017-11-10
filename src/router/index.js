import Login from '@/components/Login'
import Main from '@/components/Main'
import TableView from '@/components/TableView'
import Where from '@/components/404'
import WaitWork from '@/components/manager/waitWork'


let routes = [
  {
    path: '/',
    component: Login,
    name: 'Login'
  },
  {
    path: '/login',
    component: Login,
    name: 'Login'
  },
  {
    path: '/main',
    component: Main,
    name: 'Main',
    children: [
      { path: '/tableView', component: TableView, name: 'tableView'},
      { path: '/where', component: Where, name: 'Where'},
      { path: '/manager/waitWork', component: WaitWork, name: 'WaitWork'},
    ]
  }
];

export default routes;
