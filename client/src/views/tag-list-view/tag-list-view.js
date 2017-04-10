import React from 'react';
import Icon from 'react-fa';
import classname from 'classname';

// TODO: Extract into separate tag actions?
import { createAddTagFilterAction, createRemoveTagFilterAction } from '../../actions/browse-actions';

import './tag-list-view.css';

export default React.createClass({

    displayName: 'tag-list-view',

    propTypes: {
        tags: React.PropTypes.array.isRequired,
        selectedTags: React.PropTypes.array.isRequired
    },

    onTagClicked(e) {
        const key = e.target.innerText;
        if (this.props.selectedTags.indexOf(key) === -1) {
            createAddTagFilterAction(key);
        } else {
            createRemoveTagFilterAction(key);
        }
    },

    render() {
        const tags = this.props.tags.map((tag) => (
            <div key={tag} onClick={this.onTagClicked} className={classname({
                'gs-taglist-tag': true,
                'gs-taglist-tag-active': this.props.selectedTags.indexOf(tag) !== -1
            })}>{tag}</div>
        ));
        return (
            <div className="gs-taglist">
                <Icon name="tag" size="2x" />
                {tags}
            </div>
        );
    }
});
