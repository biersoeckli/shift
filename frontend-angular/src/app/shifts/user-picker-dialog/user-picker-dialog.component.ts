import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fluffyLoading } from 'ngx-fluffy-cow';
import * as Parse from 'parse';


@Component({
  selector: 'app-user-picker-dialog',
  templateUrl: './user-picker-dialog.component.html'
})
export class UserPickerDialogComponent {

  searchMode = true;

  constructor(public dialogRef: MatDialogRef<UserPickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public event: Parse.Object<Parse.Attributes>) { }

  selectUser(user: Parse.User<Parse.Attributes>) {
    this.dialogRef.close(user);
  }
}
