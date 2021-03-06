import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';   // convert menjadi json
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-add-biodata',
  templateUrl: 'add-biodata.html',
})
export class AddBiodataPage {
  public form: FormGroup;
  public biodataNamaDepan: any;
  public biodataNamaBelakang: any;
  public biodataJenisKelamin: any;
  public biodataAlamat: any;
  public biodataNoTelp: any;
  public biodataEmail: any;
  public isEdited: boolean = false;
  public hideForm: boolean = false;
  public pageTitle: string;
  public recordID: any = null;
  private baseURI: string = "http://localhost/ionicbiodata/";

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public formBuilder: FormBuilder,
    public toastCtrl: ToastController) {

    // buat validasi untuk form
    this.form = formBuilder.group({
      "namaDepan": ["", Validators.required],
      "namaBelakang": ["", Validators.required],
      "jenisKelamin": ["", Validators.required],
      "alamat": ["", Validators.required],
      "noTelp": ["", Validators.required],
      "email": ["", Validators.required]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddBiodataPage');

    // clear text
    this.resetFields();

    this.autoRefresh();
  }

  autoRefresh() {
    // baca ada record atau tidak
    if (this.navParams.get("record")) {   // jika ada record terbaca
      this.isEdited = true;
      this.pageTitle = "Daftar Biodata";
      this.selectEntry(this.navParams.get("record"));   // menampilkan record
    } else {   // jika tidak ada record
      this.isEdited = false;
      this.pageTitle = "Buat biodata baru";
    }
  }

  selectEntry(item) {
    this.biodataNamaDepan = item.namaDepan;
    this.biodataNamaBelakang = item.namaBelakang;
    this.biodataJenisKelamin = item.jenisKelamin;
    this.biodataAlamat = item.alamat;
    this.biodataNoTelp = item.noTelp;
    this.biodataEmail = item.email;
    this.recordID = item.idBiodata;
  }

  // membuat entry biodata baru
  createEntry(namaDepan, namaBelakang, jenisKelamin, alamat, noTelp, email) {
    let body: string = "key=create&namaDepan=" + namaDepan + "&namaBelakang=" + namaBelakang + "&jenisKelamin=" + jenisKelamin + "&alamat=" + alamat + "&noTelp=" + noTelp + "&email=" + email,
      type: string = "application/x-www-form-urlencoded; charset=UTF-8",
      headers: any = new Headers({ 'Content-Type': type }),
      options: any = new RequestOptions({ headers: headers }),
      url: any = this.baseURI + "manage.php";
    // mengeksekusi perintah untuk kirim ke table dalam database
    this.http.post(url, body, options)  // method post untuk kirim
      .subscribe((data => {
        // jika request berhasil beri notifikasi ke user
        if (data.status === 200) {    // http code
          this.hideForm = true;
          this.sendNotification(`Berhasil tambah data: ${namaDepan}`);
          this.autoRefresh();
          this.navCtrl.push(HomePage);
        }
        // jika request gagal
        else {
          this.sendNotification(`Gagal tambah data!`);
        }
      }));
  }

  // menyimpan entry biodata
  saveEntry() {
    let namaDepan: string = this.form.controls["namaDepan"].value,
      namaBelakang: string = this.form.controls["namaBelakang"].value,
      jenisKelamin: string = this.form.controls["jenisKelamin"].value,
      alamat: string = this.form.controls["alamat"].value,
      noTelp: string = this.form.controls["noTelp"].value,
      email: string = this.form.controls["email"].value;

    // deteksi apakah yg diklik edit atau simpan
    if (this.isEdited) {
      // buka form edit biodata
      this.updateEntry(namaDepan, namaBelakang, jenisKelamin, alamat, noTelp, email);
    } else {
      // buka form create entry biodata baru
      this.createEntry(namaDepan, namaBelakang, jenisKelamin, alamat, noTelp, email);
    }
  }

  // mengubah entry biodata
  updateEntry(namaDepan, namaBelakang, jenisKelamin, alamat, noTelp, email) {
    let body: string = "key=update&namaDepan=" + namaDepan + "&namaBelakang=" + namaBelakang + "&jenisKelamin=" + jenisKelamin + "&alamat=" + alamat + "&noTelp=" + noTelp + "&email=" + email + "&recordID=" + this.recordID,
      type: string = "application/x-www-form-urlencoded; charset=UTF-8",
      headers: any = new Headers({ 'Content-Type': type }),
      options: any = new RequestOptions({ headers: headers }),
      url: any = this.baseURI + "manage.php";

    this.http.post(url, body, options)
      .subscribe(data => {
        // jika request berhasil beri notifikasi ke user
        if (data.status === 200) {    // http code
          this.hideForm = true;
          this.sendNotification(`Berhasil edit data: ${namaDepan}`);
          this.autoRefresh();
          this.navCtrl.push(HomePage);
        }
        // jika request gagal
        else {
          this.sendNotification(`Gagal edit data!`);
        }
      });

  }

  // menghapus biodata
  deleteEntry(){
    let namaDepan: string = this.form.controls["namaDepan"].value,
      body: string = "key=delete&recordID=" + this.recordID,
      type: string = "application/x-www-form-urlencoded; charset=UTF-8",
      headers: any = new Headers({ 'Content-Type': type }),
      options: any = new RequestOptions({ headers: headers }),
      url: any = this.baseURI + "manage.php";

      this.http.post(url, body, options)
        .subscribe(data => {
          if (data.status === 200) {    // http code
            this.hideForm = true;
            this.sendNotification(`Berhasil hapus data: ${namaDepan}`);
            this.autoRefresh();
            this.navCtrl.push(HomePage);
          }
          // jika request gagal
          else {
            this.sendNotification(`Gagal edit data!`);
          }
        });
  }

  // mengirim notifikasi ke user
  sendNotification(message): void {
    let notification = this.toastCtrl.create({
      message: message,
      duration: 3000  // satuan milisecond
    });
    notification.present();
  }

  // clear text
  resetFields(): void {
    this.biodataNamaDepan = "";
    this.biodataNamaBelakang = "";
    this.biodataJenisKelamin = "";
    this.biodataAlamat = "";
    this.biodataNoTelp = "";
    this.biodataEmail = "";
  }

}
