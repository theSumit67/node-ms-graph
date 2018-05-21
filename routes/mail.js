// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');

/* GET /mail */
router.get('/', async function(req, res, next) {
  let parms = { title: 'Inbox', active: { inbox: true } };

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    parms.user = userName;

    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    try {
      // Get the 10 newest messages from inbox
      const result = await client
      .api('/me/mailfolders/inbox/messages')
      .top(100)
      .select('subject,from,receivedDateTime,isRead')
      .orderby('receivedDateTime DESC')
      .get();

      parms.messages = result.value;
      res.render('mail', parms);
    } catch (err) {
      parms.message = 'Error retrieving messages';
      parms.error = { status: `${err.code}: ${err.message}` };
      parms.debug = JSON.stringify(err.body, null, 2);
      res.render('error', parms);
    }

  } else {
    // Redirect to home
    res.redirect('/');
  }
});

router.get('/delete/message/:id', async function(req, res, next) {
  let id = req.params.id;
  console.log ( id );
  if ( id ){
    let parms = { title: 'Inbox', active: { inbox: true } };

    const accessToken = await authHelper.getAccessToken(req.cookies, res);
    const userName = req.cookies.graph_user_name;

    if (accessToken && userName) {
      parms.user = userName;

      // Initialize Graph client
      const client = graph.Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        }
      });

      try {
        // Get the 10 newest messages from inbox
        const result = await client
        .api('/me/mailfolders/inbox/messages/'+ id)
        .delete();

        console.log ( result.value );
        res.redirect('/mail');
      } catch (err) {
        parms.message = 'Error retrieving messages';
        parms.error = { status: `${err.code}: ${err.message}` };
        parms.debug = JSON.stringify(err.body, null, 2);
        res.render('error', parms);
      }

    } else {
      // Redirect to home
      res.redirect('/');
    }
  } else {
    // Redirect to home
    res.redirect('/');
  }
})


module.exports = router;