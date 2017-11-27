from django.db import models

class Profile(models.Model):
    userID = models.IntegerField(blank=False)
    name = models.CharField(max_length=255, blank=False)
    avatar = models.FileField(upload_to="avatar", blank=True)
    roleID = models.ForeignKey('role')
    ban = models.BooleanField(blank=True, default="0")
    topicCount = models.IntegerField(blank=False, default="0")
    replyCount = models.IntegerField(blank=False, default="0")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Role(models.Model):
    roleName = models.CharField(max_length=255, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Category(models.Model):
    categoryName = models.CharField(max_length=255, blank=False)
    categorySlug = models.CharField(max_length=255, blank=False)
    categoryImage = models.FileField(upload_to="category")
    categoryCount = models.IntegerField(blank=False, default="0")
    categoryColor = models.CharField(max_length=7, blank=False)
    categoryTextColor = models.CharField(max_length=7, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Topic(models.Model):
    profileID = models.ForeignKey('profile', blank=False)
    topicTitle = models.CharField(max_length=255, blank=False)
    topicContent = models.TextField(blank=False)
    topicSlug = models.CharField(max_length=255, blank=False)
    topicViews = models.IntegerField(blank=False, default="0")
    topicReplies = models.IntegerField(blank=False, default="0")
    topicFeature = models.BooleanField(blank=False, default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Reply(models.Model):
    profileID = models.ForeignKey('profile', blank=False)
    topicID = models.ForeignKey('topic', blank=False)
    replyID = models.IntegerField(blank=True, default="0")
    replyContent = models.TextField(blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Association(models.Model):
    categoryID = models.ForeignKey('category', blank=False)
    topicID = models.ForeignKey('topic', blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
