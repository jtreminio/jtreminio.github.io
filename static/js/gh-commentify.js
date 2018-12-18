"use strict";

const config = {
    api: '',
    owner: '',
    repo: '',
};

const ghCommentifyConfig = (api, owner, repo) => {
    config.api   = api;
    config.owner = owner;
    config.repo  = repo;
};

const ghCommentify = (commentId) => {
    // Comes from https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
    const timeSince = (date) => {
        var seconds = Math.floor((new Date() - date) / 1000);
        var interval = Math.floor(seconds / 31536000);
        if (interval > 1) {
            return interval + " years";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + " months";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + " days";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + " hours";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + " minutes";
        }

        return Math.floor(seconds) + " seconds";
    };

    const writeToComment = (element, html) => {
        element = document.createElement(element);
        element.innerHTML = html;
        document.getElementById("comments").appendChild(element);
    };

    const addReactions = (reactions, link) => {
        let returnString = "";
        const base       = "https://assets-cdn.github.com/images/icons/emoji/unicode";
        const emojiCode  = {
            "+1": `<g-emoji alias="+1" fallback-src="${base}/1f44d.png" class="emoji">👍</g-emoji>`,
            "-1": `<g-emoji alias="-1" fallback-src="${base}/1f44e.png" class="emoji">👎</g-emoji>`,
            laugh: `<g-emoji alias="smile" fallback-src="${base}/1f604.png" class="emoji">😄</g-emoji>`,
            hooray: `<g-emoji alias="tada" fallback-src="${base}/1f389.png" class="emoji">🎉</g-emoji>`,
            confused: `<g-emoji alias="thinking_face" fallback-src="${base}/1f615.png" class="emoji">😕</g-emoji>`,
            heart: `<g-emoji alias="framed_picture" fallback-src="${base}/1f5bc.png" class="emoji">🖼</g-emoji>`,
        };

        if (reactions.total_count > 0) {
            returnString += `<div class="comment-reactions">`;
            for (var key in reactions) {
                if (reactions.hasOwnProperty(key)) {
                    if (reactions[key] > 0 && key !== "total_count") {
                        returnString += `<a href="${link}" class="emoji-wrapper">${emojiCode[key]}${reactions[key]}</a>`;
                    }
                }
            }
            returnString += `</div>`;

            return returnString;
        }

        return `<div></div>`;
    };

    // Based on http://ivanzuzak.info/2011/02/18/github-hosted-comments-for-github-hosted-blogs.html
    // And http://donw.io/post/github-comments/
    const loadComments = (data) => {
        for (var i = 0; i < data.length; i++) {
            const cuser       = data[i].user.login;
            const cuserlink   = data[i].user.html_url;
            const clink       = data[i].html_url;
            const cbody       = data[i].body_html;
            const cavatarlink = data[i].user.avatar_url;
            const cdate       = new Date(data[i].created_at);
            const creactions  = addReactions(data[i].reactions, clink);
            const commentHTML = `
                <div class="comment">
                    <div class="comment-header">
                        <a class="comment-username" href="${cuserlink}">
                            <img src="${cavatarlink}" alt="" width="40" height="40" /> ${cuser}
                        </a> commented <a class="comment-date" href="${clink}">${timeSince(cdate)} ago</a>
                    </div>
                    <div class="comment-body">${cbody}</div>${creactions}
                </div>`;

            writeToComment("div", commentHTML);
        }

        const callToAction = `
            <hr />
            <p>
                Comments are using GitHub Issues. You can post by replying to
                <a href="https://github.com/${config.owner}/${config.repo}/issues/${commentId}">issue #${commentId}</a>.
            </p>`;

        writeToComment("div", callToAction);
    };

    var writeFirstComment = function () {
        var callToAction = `
            <p>
                This post has no comments, yet, you could be the first.
                Comments are using GitHub Issues. You can post by replying to
                <a href="https://github.com/${config.owner}/${config.repo}/issues/${commentId}">issue #${commentId}</a>.
            </p>`;

        writeToComment("div", callToAction);
    };

    const url = `${config.api}/repos/${config.owner}/${config.repo}/issues/${commentId}/comments`;

    window
        .fetch(url, {Accept: "application/vnd.github.v3.html+json"})
        .then(response => {
            return response.json();
        })
        .then(json => {
            return json.length
                ? loadComments(json)
                : writeFirstComment();
        });
};
