from django.shortcuts import render
from random import randint
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.paginator import Paginator
from django.contrib.humanize.templatetags.humanize import naturaltime
from django.contrib.auth.models import User
import datetime

from .models import Profile, Role, Category, Topic, Reply, Association
from .serializers import ProfileSerializer, RoleSerializer, CategorySerializer, TopicSerializer, ReplySerializer, AssociationSerializer

class UserView(APIView):

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"error":"You are not logged in."})

        profile = Profile.objects.filter(userID=request.user.id).values('id', 'userID', 'name', 'avatar', 'roleID')

        result = {"user":profile[0]}
        return Response(result)

    def post(self, request):
        name = request.POST.get('username')
        if not name:
            return Response({"error":"Please fill out an username"})

        email = request.POST.get('email')
        if not email:
            return Response({"error":"Please fill out an email"})

        password = request.POST.get('password')
        if not password:
            return Response({"error":"Please fill out a password"})

        avatar = 'http://avatar.technopathic.me/cat-avatar-generator.php?seed='+name

        user = User.objects.create_user(
            password = password,
            is_superuser = 0,
            username = name,
            first_name = 'firstName',
            last_name = 'lastName',
            email = email,
            is_staff = 0,
            is_active = 1
        )
        user.save()

        profile = Profile(
            userID = user.id,
            name = name,
            roleID_id = 2,
            avatar = avatar,
            ban = 0,
            topicCount = 0,
            replyCount = 0,
        )
        profile.save()

        result = {'success': 'Thanks for Signing Up!'}
        return Response(result)

    def put(self, request):
        if not request.user.is_authenticated:
            return Response({"error":"You are not logged in."})

        if len(request.FILES['avatar']) > 0:
            avatar = request.FILES['avatar']
            profile = Profile.objects.get(userID=request.user.id)
            profile.avatar = avatar
            profile.save(update_fields=['avatar'])

        profile = Profile.objects.filter(userID=request.user.id).values('avatar')

        result = {'profile':profile[0]['avatar']}
        return Response(result)

    def show(self, request, id):

        profile = Profile.objects.filter(id=id).values('id', 'userID', 'name', 'avatar', 'roleID', 'topicCount', 'replyCount')

        result = {"profile":profile[0]}
        return Response(result)

class CategoryView(APIView):

    def get(self, request):

        categories = Category.objects.all().values('id', 'categoryName', 'categorySlug', 'categoryImage', 'categoryCount', 'categoryColor', 'categoryTextColor')

        result = {'categories':categories}
        return Response(result)

    def post(self, request):

        if not request.user.is_authenticated:
            return Response({"error":"You are not logged in."})

        profile = Profile.objects.filter(userID=request.user.id).values('id', 'roleID')

        if profile[0]['roleID'] == 1:
            return Response({"error":"You do not have permission."})

        categoryName = request.POST.get('categoryName')
        if not categoryName:
            return Response({"error":"Fill out a category name"})

        categoryImage = request.FILES['categoryImage']
        if len(categoryImage) <= 0:
            return Response({"error":"Missing category Image"})

        categoryColor = request.POST.get('categoryColor')
        if not categoryColor:
            return Response({"error":"Missing category color"})

        categoryTextColor = request.POST.get('categoryTextColor')
        if not categoryTextColor:
            return Response({"error":"Missing category text color"})

        categorySlug = categoryName.replace(' ', '-').lower()

        category = Category(
            categoryName = categoryName,
            categoryImage = categoryImage,
            categoryColor = categoryColor,
            categoryTextColor = categoryTextColor,
            categorySlug = categorySlug,
            categoryCount = 0
        )
        category.save()

        result = {"category":category}
        return Response(result)

class ShowCategory(APIView):

    def get(self, request, slug, count, page):
        category = Category.objects.filter(categorySlug=slug).values('id')
        topics = Association.objects.filter(categoryID=category[0]['id']).values('topicID', 'topicID__profileID__avatar', 'topicID__profileID__name', 'topicID__topicTitle', 'topicID__topicContent', 'topicID__topicSlug', 'topicID__topicViews', 'topicID__topicReplies', 'topicID__created_at', 'topicID__updated_at')

        topicsPage = Paginator(topics, count)
        topics = topicsPage.page(page)

        nextPage = topics.has_next()

        if nextPage:
            nextPageNum = topics.next_page_number()
        else:
            nextPageNum = 0

        for topic in topics:
            categories = Association.objects.filter(topicID=topic['topicID']).values('categoryID__categoryName', 'categoryID__categoryColor', 'categoryID__categoryTextColor', 'categoryID__categorySlug')
            topic['categories'] = categories

            reply = Reply.objects.filter(topicID=topic['id']).values('id', 'created_at').order_by('-created_at')
            if reply:
                topic['topicDate'] = naturaltime(reply[0]['created_at'])
            else:
                topic['topicDate'] = naturaltime(topic['created_at'])

        topics = list(topics)

        result = {"topics":topics, "nextPageNum": nextPageNum}
        return Response(result)


class TopicView(APIView):

    def get(self, request, count, page, feature, order):
        if order == "1":
            order = '-updated_at'
        elif order == "0":
            order = '-created_at'

        if feature == "0" :
            topics = Topic.objects.filter(topicFeature=0).values('id', 'profileID__avatar', 'profileID__name', 'topicTitle', 'topicContent', 'topicSlug', 'topicViews', 'topicReplies','created_at', 'updated_at').order_by(order)
        else:
            topics = Topic.objects.filter(topicFeature=1).values('id', 'profileID__avatar', 'profileID__name', 'topicTitle', 'topicContent', 'topicSlug', 'topicViews', 'topicReplies', 'created_at', 'updated_at').order_by(order)

        topicsPage = Paginator(topics, count)
        topics = topicsPage.page(page)

        nextPage = topics.has_next()

        if nextPage:
            nextPageNum = topics.next_page_number()
        else:
            nextPageNum = 0

        for topic in topics:
            categories = Association.objects.filter(topicID=topic['id']).values('categoryID__categoryName', 'categoryID__categoryColor', 'categoryID__categoryTextColor', 'categoryID__categorySlug')
            topic['categories'] = categories

            reply = Reply.objects.filter(topicID=topic['id']).values('id', 'created_at').order_by('-created_at')
            if reply:
                topic['topicDate'] = naturaltime(reply[0]['created_at'])
            else:
                topic['topicDate'] = naturaltime(topic['created_at'])

        topics = list(topics)

        result = {"topics":topics, "nextPageNum": nextPageNum}
        return Response(result)

    def delete(self, request, id):
        if not request.user.is_authenticated:
            return Response({"error":"You are not logged in."})

        profile = Profile.objects.filter(userID=request.user.id).values('id', 'ban', 'roleID')

        if not profile[0]['roleID'] == 1:
            return Response({"error":"You do not have permission."})


        topic = Topic.objects.filter(id=id).values('id', 'profileID')
        associations = Association.objects.filter(topicID=topic[0]['id']).values('categoryID')
        for association in associations:
            category = Category.objects.filter(categoryID=association['categoryID']).values('categoryCount')
            category = Category.objects.filter(categoryID=association['categoryID']).update(categoryCount = category[0]['categoryCount'] - 1)
            association.delete()

        profile = Profile.objects.filter(id=topic[0]['profileID']).values('topicCount')
        profile = Profile.objects.filter(id=topic[0]['profileID']).update(topicCount = profile[0]['topicCount'] - 1)

        topic.delete()

        result = {"success":"Topic Deleted"}
        return Response(result)

class StoreTopic(APIView):

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error":"You are not logged in."})

        profile = Profile.objects.filter(userID=request.user.id).values('id', 'ban')

        if profile[0]['ban'] == 1:
            return Response({"error":"Looks like you were banned."})

        topicTitle = request.POST.get('threadTitle')
        if not topicTitle:
            return Response({"error":"Missing thread title"})

        topicContent = request.POST.get('threadContent')
        if not topicContent:
            return Response({"error":"Needs thread content"})

        topicCategories = request.POST.getlist('threadCategories')
        if len(topicCategories) <= 0:
            return Response({"error":"Select a category"})

        topicViews = 0
        topicReplies = 0
        topicFeature = 0

        topicSlug = topicTitle.replace(' ', '-').lower()

        topicCheck = Topic.objects.filter(topicSlug=topicSlug).values('topicSlug')
        if topicCheck:
            topicSlug = topicSlug + '_' + str(randint(1,99))

        topic = Topic(
            profileID_id = profile[0]['id'],
            topicTitle = topicTitle,
            topicContent = topicContent,
            topicViews = topicViews,
            topicReplies = topicReplies,
            topicFeature = topicFeature,
            topicSlug = topicSlug
        )
        topic.save()

        topicCount = Profile.objects.filter(userID=request.user.id).values('topicCount')
        profile = Profile.objects.filter(userID=request.user.id).update(topicCount = topicCount[0]['topicCount'] + 1)

        for categories in topicCategories:
            categoryCount = Category.objects.filter(id=categories).values('categoryCount')
            category = Category.objects.filter(id=categories).update(categoryCount = categoryCount[0]['categoryCount'] + 1)
            association = Association(
                categoryID_id = categories,
                topicID_id = topic.id
            )
            association.save()

        topic = Topic.objects.filter(id=topic.id).values('id', 'profileID__avatar', 'profileID__name', 'topicTitle', 'topicContent', 'topicSlug', 'topicViews', 'topicReplies', 'created_at', 'updated_at')
        categories = Association.objects.filter(topicID=topic[0]['id']).values('categoryID__categoryName', 'categoryID__categoryColor', 'categoryID__categoryTextColor', 'categoryID__categorySlug')
        topic = list(topic)
        print(topic[0])
        topic[0]['categories'] = categories

        result = {"topic":topic[0]}
        return Response(result)

class ShowTopic(APIView):

    def get(self, request, slug):
        topic = Topic.objects.filter(topicSlug=slug).values('id', 'profileID__avatar', 'profileID__name', 'topicTitle', 'topicContent', 'topicSlug', 'topicViews', 'topicReplies', 'created_at', 'updated_at')
        for t in topic:
            t['topicDate'] = naturaltime(t['created_at'])

        categories = Association.objects.filter(topicID=topic[0]['id']).values('categoryID__categoryName', 'categoryID__categoryColor', 'categoryID__categoryTextColor', 'categoryID__categorySlug')

        Topic.objects.filter(id=topic[0]['id']).update(topicViews=topic[0]['topicViews'] + 1)

        result = {"topic":topic[0], "categories":categories}
        return Response(result)

class ReplyView(APIView):

    def getReplies(self, reply):
        childReplies = []
        children = Reply.objects.filter(replyID=reply['id']).values('id', 'profileID__avatar', 'profileID__name', 'profileID__roleID', 'replyID', 'replyContent', 'created_at', 'updated_at')
        if children:
            for child in children:
                if reply['id'] == child['replyID']:
                    child['replyDate'] = naturaltime(child['created_at'])
                    childReplies.append(child)

                    self.getReplies(child)

        reply['childReplies'] = childReplies

        return reply


    def get(self, request, id, page):
        repliesArray = []
        replies = Reply.objects.filter(topicID=id).values('id', 'profileID__avatar', 'profileID__name', 'profileID__roleID', 'replyID', 'replyContent', 'created_at', 'updated_at')
        for reply in replies:
            reply['replyDate'] = naturaltime(reply['created_at'])
            self.getReplies(reply)
            if reply['replyID'] == 0:
                repliesArray.append(reply)

        replyPage = Paginator(repliesArray, 15)
        repliesArray = replyPage.page(page)

        nextReply = repliesArray.has_next()

        if nextReply:
            nextReplyNum = repliesArray.next_page_number()
        else:
            nextReplyNum = 0

        repliesArray = list(repliesArray)

        result = {"replies":repliesArray, "nextReplyNum":nextReplyNum}
        return Response(result)


class StoreReply(APIView):

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error":"You are not logged in."})

        profile = Profile.objects.filter(userID=request.user.id).values('id', 'ban')

        if profile[0]['ban'] == 1:
            return Response({"error":"You were banned."})

        topicID = request.POST.get('topicID')
        replyID = request.POST.get('replyID')
        replyContent = request.POST.get('replyContent')
        if not replyContent:
            return Response({"error":"Cannot make an empty reply"})


        reply = Reply(
            profileID_id = profile[0]['id'],
            topicID_id = topicID,
            replyID = replyID,
            replyContent = replyContent
        )
        reply.save()

        profile = Profile.objects.filter(userID=request.user.id).values('replyCount')
        profile = Profile.objects.filter(userID=request.user.id).update(replyCount=profile[0]['replyCount']+1)

        topic = Topic.objects.get(id=topicID)
        topic.updated_at = datetime.datetime.now()
        topic.save(update_fields=['updated_at'])

        topic = Topic.objects.filter(id=topicID).values('topicReplies')
        Topic.objects.filter(id=topicID).update(topicReplies=topic[0]['topicReplies']+1)

        reply = Reply.objects.filter(id=reply.id).values('id', 'profileID__avatar', 'profileID__name', 'profileID__roleID', 'replyID', 'replyContent', 'created_at', 'updated_at')

        result = {"reply":reply}
        return Response(result)


class SearchView(APIView):

    def post(self, request, count, page):
        searchContent = request.POST.get('searchContent')
        if not searchContent:
            return Reponse({"error":"Nothing Searched."})

        topics = Topic.objects.filter(topicTitle__search=searchContent).values('id', 'profileID__avatar', 'profileID__name', 'topicTitle', 'topicContent', 'topicSlug', 'topicViews', 'topicReplies','created_at', 'updated_at').order_by('-updated_at') | Topic.objects.filter(topicContent__search=searchContent).values('id', 'profileID__avatar', 'profileID__name', 'topicTitle', 'topicContent', 'topicSlug', 'topicViews', 'topicReplies','created_at', 'updated_at').order_by('-updated_at')

        topicsPage = Paginator(topics, count)
        topics = topicsPage.page(page)

        nextPage = topics.has_next()

        if nextPage:
            nextPageNum = topics.next_page_number()
        else:
            nextPageNum = 0

        for topic in topics:
            categories = Association.objects.filter(topicID=topic['id']).values('categoryID__categoryName', 'categoryID__categoryColor', 'categoryID__categoryTextColor', 'categoryID__categorySlug')
            topic['categories'] = categories

            reply = Reply.objects.filter(topicID=topic['id']).values('id', 'created_at').order_by('-created_at')
            if reply:
                topic['topicDate'] = naturaltime(reply[0]['created_at'])
            else:
                topic['topicDate'] = naturaltime(topic['created_at'])

        topics = list(topics)

        result = {"topics":topics, "nextPageNum": nextPageNum}
        return Response(result)
