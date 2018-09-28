import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import RunIcon from '@material-ui/icons/PlayArrow';

class EnhancedTableHead extends React.Component {
  static propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
  };

  static rows = [
    { id: 'host', label: 'Host', numeric: false, disablePadding: true },
    { id: 'lastIP', label: 'Last update IP', numeric: false, disablePadding: true },
    { id: 'lastDate', label: 'Last run date', numeric: false, disablePadding: true },
    { id: 'status', label: 'Status', numeric: false, disablePadding: true },
  ];

  createSortHandler = (rowId) => (event) => {
    this.props.onRequestSort(event, rowId);
  };

  render() {
    const { order, orderBy } = this.props;

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox"/>
          {EnhancedTableHead.rows.map(row => (
            <TableCell
              key={row.id}
              numeric={row.numeric}
              padding={row.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === row.id ? order : false}
            >
              <Tooltip
                title="Sort"
                placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                enterDelay={300}
              >
                <TableSortLabel
                  active={orderBy === row.id}
                  direction={order}
                  onClick={this.createSortHandler(row.id)}
                >
                  {row.label}
                </TableSortLabel>
              </Tooltip>
            </TableCell>
          ), this)}
        </TableRow>
      </TableHead>
    );
  }
}

const StyledTablePagination = withStyles({
  caption: {
    display: 'none',
  },
  input: {
    display: 'none',
  },
})(TablePagination);

const StyledIconButton = withStyles({
  root: {
    transform: 'scale(0.8)',
  },
})(IconButton);

// eslint-disable-next-line
class EnhancedTable extends React.Component {
  static propTypes = {
    classes: PropTypes.object,
    onClickDelete: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickRun: PropTypes.func,
    onClickCheckBox: PropTypes.func,
    items: PropTypes.array,
  };

  // noinspection JSUnusedGlobalSymbols
  static defaultProps = {
    classes: {},
    onClickDelete: undefined,
    onClickEdit: undefined,
    onClickRun: undefined,
    onClickCheckBox: undefined,
    items: [],
  };

  static desc(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  static getSorting(order, orderBy) {
    return order === 'desc' ? (a, b) => EnhancedTable.desc(a, b, orderBy) : (a, b) => -EnhancedTable.desc(a, b, orderBy);
  }

  static stableSort(array, cmp) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = cmp(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
  }

  state = {
    order: 'asc',
    orderBy: 'host',
    page: 0,
    rowsPerPage: 5,
  };

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  get tableItems() {
    return this.props.items.map((item, index) => ({
      id: index,
      host: `${item.host.subdomain ? `${item.host.subdomain}.` : ''}${item.host.domain}`,
      lastIP: item.$data.lastIP,
      lastDate: item.$data.lastDate,
      status: item.$data.status,
      enabled: item.enabled,
    }));
  }

  render() {
    const { classes, onClickDelete, onClickEdit, onClickRun, onClickCheckBox } = this.props;
    const { order, orderBy, rowsPerPage, page } = this.state;
    const data = this.tableItems;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <Toolbar>
          <Typography variant="title" id="tableTitle">
            Task List
          </Typography>
        </Toolbar>
        <div className={classes.tableWrapper}>
          <Table aria-labelledby="tableTitle">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
            />
            <TableBody>
              {EnhancedTable.stableSort(data, EnhancedTable.getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={n.enabled}
                    tabIndex={-1}
                    key={n.id}
                    selected={n.enabled}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox style={{ display: !onClickCheckBox ? 'none' : '' }}
                                checked={n.enabled} onClick={() => onClickCheckBox(n.id)}/>
                    </TableCell>
                    <TableCell component="th" scope="row" padding="none">
                      {n.host}
                    </TableCell>
                    <TableCell padding="none">{n.lastIP}</TableCell>
                    <TableCell padding="none">{n.lastDate}</TableCell>
                    <TableCell padding="none">{n.status}</TableCell>
                    {(() => {
                      if (onClickRun)
                        return (<TableCell className={classes.tableButtonWrapper}>
                          <StyledIconButton className={classes.iconButton} aria-label="Run"
                                            onClick={() => onClickRun(n.id)}>
                            <RunIcon/>
                          </StyledIconButton>
                        </TableCell>);
                    })()}
                    {(() => {
                      if (onClickEdit)
                        return (<TableCell className={classes.tableButtonWrapper}>
                          <StyledIconButton className={classes.iconButton} aria-label="Edit"
                                            onClick={() => onClickEdit(n.id)}>
                            <EditIcon/>
                          </StyledIconButton>
                        </TableCell>);
                    })()}
                    {(() => {
                      if (onClickDelete)
                        return (<TableCell className={classes.tableButtonWrapper}>
                          <StyledIconButton className={classes.iconButton} aria-label="Delete"
                                            onClick={() => onClickDelete(n.id)}>
                            <DeleteIcon/>
                          </StyledIconButton>
                        </TableCell>);
                    })()}
                  </TableRow>
                ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={7}/>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <StyledTablePagination
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}

export default withStyles({
  root: {
    width: '100%',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  iconButton: {
    width: '48px',
  },
  tableButtonWrapper: {
    width: '56px',
    padding: '0 !important',
  },
})(EnhancedTable);
