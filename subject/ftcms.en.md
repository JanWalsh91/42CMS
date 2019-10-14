# 42CMS

## Contents

## Introduction

The objective of this project is to recreate multiple interconnected functionalities necessary for business users to run an e-commerce platform.

A business group wants to expand their brick and mortar retail online, but the company's business users have no knowledge of web technologies. They want you to create a Content Management System which is easy for them to handle and which generates front-end e-commerce websites.



## Objectives Overview

The objective of this project is to respond to **general** and **specific** needs of business users. Your project should take the following structure:

- **CMS Back-end**:
  - **Web API**: An api to get access your e-commerce database. This web API if used by the front end application. With this api, you should be able to create an business account, create products, sort them in catalogs and manager customer sales, for example.
  - **Back Office Website**: A front-end web application for business users to manage the e-commerce database. This uses the aforementioned web API.
- **CMS Front-end**: Drawing from the database and back-end configurations, the CMS should dynamically create the front-end e-commerce websites.



## General Instructions

You are free to use whatever tech and languages you wish. You cannot use services or libraries which handle the project functionalities.

### Required Functionalities:

#### Products, Catalogs, and Categories

We want to be able to:
- add products to our database
- create one of three types of products: basic products, master products and variant products
  - *Master Product*: This kind of product is abstract and serves as a template for its Variant Products which differ by one or a set of variation attributes. For example, a T-Shirt with two variation attributes, size and color, can be considered a Master Product.
  - *Variation Product*: This product are concrete products which vary according to a Master Product's variation attributes. For example, a perfume can come in different bottle sizes, such as 30ml and 60ml. A variant product must have its Master Product's variation attributes defined.
  - *Basic Product*: This is a simple, concrete product with no relation to a Master or Variant Product.
- have at least the following product attributes: 
  - ID
  - EAN
  - name
  - description
  - image
  - online (boolean)
  - onlineFrom (date)
  - onlineTo (date)
  - available
- assign our products to one or more catalogs
- within each catalog, we want to assign products to one or more categories.

#### Extensible Objects and Object Definitions
A business object represents any entity in the back end, such as a Master Product, a Catalog, or a User.
We want to be able to:
- extend theses extensible objects with custom attributes. We want access to the following types:
  - string
  - number
  - boolean
  - string array
  - number array
  - string enum (with multiselect option)
  - image
  - Date
- choose if these attributes are localizable

#### Locales
Business Object attributes, especially those of categories and products, are visible on the front-end, such as the product name and description. We want to tailor the site's display language to that of the user. We want to be able to:
- add locales in the format ()
- define business attribute values by locale
- set up a system of locale fallbacks. For example, we would like to set the fallback of the "en_CA" locale to "en_US", and "en_US" to "en", so that if we've defined a product name in "en_US", but not in "en_CA" and are accessing a site in "en_CA", the product name under en_US will be displayed.

#### Sites
A site is defined by a url. (You can simulate the use of a url with a path)
We want to be able to:
- assign Catalogs to a Site
- assign allowed locales to a Site
- assign Price Books to a Site

#### Settings

#### Image Management
We want to be able to:
- manage product images (upload, download, delete, assign to product.image attribute)

#### Price Books
Price Books contain information about a set of products in a currency

### Bonus Functionalities: 

#### Import and Export System
We want a simple system to export and import data in an xml format about our products and other business objects.
We want to be able to:
- import and export Products
- import and export Catalogs and Categories
- import and export Object Type Definitions 


#### Static web Content
#### Bonus Product Types
We want to be able to create additional product types:
- **Product Bundles**:
- **Product Sets**: