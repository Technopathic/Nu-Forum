from django.conf.urls import url, include
from rest_framework.urlpatterns import format_suffix_patterns
from .views import UserView, CategoryView, TopicView, ReplyView, SearchView, ShowCategory, ShowTopic, StoreTopic, StoreReply

#from .views import
from rest_framework_jwt.views import obtain_jwt_token

urlpatterns = {
    url(r'^signIn', obtain_jwt_token),
    url(r'^user', UserView.as_view(), name='user'),
    url(r'^showcategory/(?P<slug>[\w\-]+)/(?P<count>(\d+))/(?P<page>(\d+))/$', ShowCategory.as_view(), name='showCategory'),
    url(r'^category/$', CategoryView.as_view(), name='category'),
    url(r'^showTopic/(?P<slug>[\w\-]+)/$', ShowTopic.as_view(), name='showTopic'),
    url(r'^storeTopic/$', StoreTopic.as_view(), name='storeTopic'),
    url(r'^topic/(?P<count>(\d+))/(?P<page>(\d+))/(?P<feature>(\d+))/(?P<order>(\d+))/$', TopicView.as_view(), name='topic'),
    url(r'^storeReply/$', StoreReply.as_view(), name='storeReply'),
    url(r'^reply/(?P<id>(\d+))/(?P<page>(\d+))/$', ReplyView.as_view(), name='reply'),
    url(r'^search/(?P<count>(\d+))/(?P<page>(\d+))/$', SearchView.as_view(), name='search'),
}

urlpatterns = format_suffix_patterns(urlpatterns)
