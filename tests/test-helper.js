// import resolver from './helpers/resolver';
// import {
//   setResolver
// } from 'ember-qunit';

// setResolver(resolver);

import Application from "../app";
import config from "browse/config/environment";
import { setApplication } from "@ember/test-helpers";
import { start } from "ember-qunit";

setApplication(Application.create(config.APP));

start();
