import HomeView from '../pages/home/homeView';
import LoginView from '../pages/login/loginView';
import RegisterView from '../pages/register/registerView';
import DetailStoryView from '../pages/detail-story/detailStoryView';
import DetailStoryModel from '../pages/detail-story/detailStoryModel';
import DetailStoryPresenter from '../pages/detail-story/detailStoryPresenter';
import AddStoryView from '../pages/add-story/addStoryView';

const routes = {
  '/': new HomeView(),                    
  '/login': new LoginView(),              
  '/register': new RegisterView(),        
  '/stories/:id': new DetailStoryPresenter({
    view: new DetailStoryView(),
    model: new DetailStoryModel(),
  }),  // Halaman Detail Cerita
  '/add-story': new AddStoryView(),     
};

export default routes;
