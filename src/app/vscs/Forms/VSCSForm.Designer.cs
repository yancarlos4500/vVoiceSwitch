namespace RossCarlson.Vatsim.vERAM.UI.Forms
{
	partial class VSCSForm
	{
		/// <summary>
		/// Required designer variable.
		/// </summary>
		private System.ComponentModel.IContainer components = null;

		/// <summary>
		/// Clean up any resources being used.
		/// </summary>
		/// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
		protected override void Dispose(bool disposing)
		{
			if (disposing && (components != null)) {
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		#region Windows Form Designer generated code

		/// <summary>
		/// Required method for Designer support - do not modify
		/// the contents of this method with the code editor.
		/// </summary>
		private void InitializeComponent()
		{
			this.pnlAG1 = new System.Windows.Forms.Panel();
			this.pnlAG2 = new System.Windows.Forms.Panel();
			this.pnlCAQueue = new System.Windows.Forms.Panel();
			this.btnCAQueue4 = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSDAButton();
			this.btnCAQueue3 = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSDAButton();
			this.btnCAQueue2 = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSDAButton();
			this.btnCAQueue1 = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSDAButton();
			this.pnlGG1 = new System.Windows.Forms.Panel();
			this.pnlGG2 = new System.Windows.Forms.Panel();
			this.pnlGGMisc = new System.Windows.Forms.Panel();
			this.voiceMonitor = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSVoiceMonitor();
			this.btnHold = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButton();
			this.btnCallAnswer = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButton();
			this.pnlPTTButtons = new System.Windows.Forms.Panel();
			this.btnPTTVHF = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButton();
			this.btnPTTBoth = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButton();
			this.btnPTTUHF = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButton();
			this.pnlMain = new System.Windows.Forms.Panel();
			this.auxMessageArea = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSAuxMessageArea();
			this.messageArea = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSMessageArea();
			this.funcMenuMain = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSFunctionMenu();
			this.lblRTStatus = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSLabel();
			this.lblPage = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSLabel();
			this.lblMenu = new RossCarlson.Vatsim.vERAM.UI.Controls.VSCSLabel();
			this.pnlCAQueue.SuspendLayout();
			this.pnlGGMisc.SuspendLayout();
			this.pnlPTTButtons.SuspendLayout();
			this.pnlMain.SuspendLayout();
			this.SuspendLayout();
			// 
			// pnlAG1
			// 
			this.pnlAG1.Location = new System.Drawing.Point(11, 13);
			this.pnlAG1.Name = "pnlAG1";
			this.pnlAG1.Size = new System.Drawing.Size(110, 72);
			this.pnlAG1.TabIndex = 1;
			// 
			// pnlAG2
			// 
			this.pnlAG2.Location = new System.Drawing.Point(127, 13);
			this.pnlAG2.Name = "pnlAG2";
			this.pnlAG2.Size = new System.Drawing.Size(110, 72);
			this.pnlAG2.TabIndex = 2;
			// 
			// pnlCAQueue
			// 
			this.pnlCAQueue.Controls.Add(this.btnCAQueue4);
			this.pnlCAQueue.Controls.Add(this.btnCAQueue3);
			this.pnlCAQueue.Controls.Add(this.btnCAQueue2);
			this.pnlCAQueue.Controls.Add(this.btnCAQueue1);
			this.pnlCAQueue.Location = new System.Drawing.Point(0, 240);
			this.pnlCAQueue.Name = "pnlCAQueue";
			this.pnlCAQueue.Size = new System.Drawing.Size(408, 80);
			this.pnlCAQueue.TabIndex = 6;
			// 
			// btnCAQueue4
			// 
			this.btnCAQueue4.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnCAQueue4.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(180)))), ((int)(((byte)(180)))), ((int)(((byte)(180)))));
			this.btnCAQueue4.FlashBackground = false;
			this.btnCAQueue4.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnCAQueue4.ForeColor = System.Drawing.Color.Black;
			this.btnCAQueue4.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnCAQueue4.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnCAQueue4.Location = new System.Drawing.Point(300, 12);
			this.btnCAQueue4.Name = "btnCAQueue4";
			this.btnCAQueue4.NonLatching = false;
			this.btnCAQueue4.OnLandLineWith = null;
			this.btnCAQueue4.Size = new System.Drawing.Size(84, 68);
			this.btnCAQueue4.Spec = null;
			this.btnCAQueue4.TabIndex = 3;
			this.btnCAQueue4.MouseClick += new System.Windows.Forms.MouseEventHandler(this.VSCSDAButton_MouseClick);
			// 
			// btnCAQueue3
			// 
			this.btnCAQueue3.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnCAQueue3.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(180)))), ((int)(((byte)(180)))), ((int)(((byte)(180)))));
			this.btnCAQueue3.FlashBackground = false;
			this.btnCAQueue3.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnCAQueue3.ForeColor = System.Drawing.Color.Black;
			this.btnCAQueue3.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnCAQueue3.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnCAQueue3.Location = new System.Drawing.Point(204, 12);
			this.btnCAQueue3.Name = "btnCAQueue3";
			this.btnCAQueue3.NonLatching = false;
			this.btnCAQueue3.OnLandLineWith = null;
			this.btnCAQueue3.Size = new System.Drawing.Size(84, 68);
			this.btnCAQueue3.Spec = null;
			this.btnCAQueue3.TabIndex = 2;
			this.btnCAQueue3.MouseClick += new System.Windows.Forms.MouseEventHandler(this.VSCSDAButton_MouseClick);
			// 
			// btnCAQueue2
			// 
			this.btnCAQueue2.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnCAQueue2.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(180)))), ((int)(((byte)(180)))), ((int)(((byte)(180)))));
			this.btnCAQueue2.FlashBackground = false;
			this.btnCAQueue2.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnCAQueue2.ForeColor = System.Drawing.Color.Black;
			this.btnCAQueue2.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnCAQueue2.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnCAQueue2.Location = new System.Drawing.Point(108, 12);
			this.btnCAQueue2.Name = "btnCAQueue2";
			this.btnCAQueue2.NonLatching = false;
			this.btnCAQueue2.OnLandLineWith = null;
			this.btnCAQueue2.Size = new System.Drawing.Size(84, 68);
			this.btnCAQueue2.Spec = null;
			this.btnCAQueue2.TabIndex = 1;
			this.btnCAQueue2.MouseClick += new System.Windows.Forms.MouseEventHandler(this.VSCSDAButton_MouseClick);
			// 
			// btnCAQueue1
			// 
			this.btnCAQueue1.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnCAQueue1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(180)))), ((int)(((byte)(180)))), ((int)(((byte)(180)))));
			this.btnCAQueue1.FlashBackground = false;
			this.btnCAQueue1.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnCAQueue1.ForeColor = System.Drawing.Color.Black;
			this.btnCAQueue1.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnCAQueue1.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnCAQueue1.Location = new System.Drawing.Point(12, 12);
			this.btnCAQueue1.Name = "btnCAQueue1";
			this.btnCAQueue1.NonLatching = false;
			this.btnCAQueue1.OnLandLineWith = null;
			this.btnCAQueue1.Size = new System.Drawing.Size(84, 68);
			this.btnCAQueue1.Spec = null;
			this.btnCAQueue1.TabIndex = 0;
			this.btnCAQueue1.MouseClick += new System.Windows.Forms.MouseEventHandler(this.VSCSDAButton_MouseClick);
			// 
			// pnlGG1
			// 
			this.pnlGG1.Location = new System.Drawing.Point(11, 91);
			this.pnlGG1.Name = "pnlGG1";
			this.pnlGG1.Size = new System.Drawing.Size(110, 72);
			this.pnlGG1.TabIndex = 3;
			// 
			// pnlGG2
			// 
			this.pnlGG2.Location = new System.Drawing.Point(127, 91);
			this.pnlGG2.Name = "pnlGG2";
			this.pnlGG2.Size = new System.Drawing.Size(110, 72);
			this.pnlGG2.TabIndex = 4;
			// 
			// pnlGGMisc
			// 
			this.pnlGGMisc.Controls.Add(this.voiceMonitor);
			this.pnlGGMisc.Controls.Add(this.btnHold);
			this.pnlGGMisc.Controls.Add(this.btnCallAnswer);
			this.pnlGGMisc.Location = new System.Drawing.Point(408, 240);
			this.pnlGGMisc.Name = "pnlGGMisc";
			this.pnlGGMisc.Size = new System.Drawing.Size(192, 160);
			this.pnlGGMisc.TabIndex = 7;
			// 
			// voiceMonitor
			// 
			this.voiceMonitor.BackColor = System.Drawing.Color.White;
			this.voiceMonitor.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.voiceMonitor.ForeColor = System.Drawing.Color.Black;
			this.voiceMonitor.Location = new System.Drawing.Point(68, 24);
			this.voiceMonitor.Name = "voiceMonitor";
			this.voiceMonitor.Size = new System.Drawing.Size(124, 136);
			this.voiceMonitor.TabIndex = 2;
			// 
			// btnHold
			// 
			this.btnHold.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnHold.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(82)))), ((int)(((byte)(222)))), ((int)(((byte)(238)))));
			this.btnHold.FlashBackground = false;
			this.btnHold.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnHold.ForeColor = System.Drawing.Color.Black;
			this.btnHold.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnHold.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnHold.Location = new System.Drawing.Point(0, 92);
			this.btnHold.Name = "btnHold";
			this.btnHold.NonLatching = false;
			this.btnHold.Size = new System.Drawing.Size(56, 68);
			this.btnHold.TabIndex = 1;
			this.btnHold.Text = "\r\n HOLD";
			this.btnHold.Click += new System.EventHandler(this.BtnHold_Clicked);
			// 
			// btnCallAnswer
			// 
			this.btnCallAnswer.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnCallAnswer.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(82)))), ((int)(((byte)(222)))), ((int)(((byte)(238)))));
			this.btnCallAnswer.FlashBackground = false;
			this.btnCallAnswer.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnCallAnswer.ForeColor = System.Drawing.Color.Black;
			this.btnCallAnswer.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnCallAnswer.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnCallAnswer.Location = new System.Drawing.Point(0, 12);
			this.btnCallAnswer.Name = "btnCallAnswer";
			this.btnCallAnswer.NonLatching = false;
			this.btnCallAnswer.Size = new System.Drawing.Size(56, 68);
			this.btnCallAnswer.TabIndex = 0;
			this.btnCallAnswer.Text = "\r\n CALL\r\n ANS";
			this.btnCallAnswer.Click += new System.EventHandler(this.BtnCallAnswer_Click);
			// 
			// pnlPTTButtons
			// 
			this.pnlPTTButtons.Controls.Add(this.btnPTTVHF);
			this.pnlPTTButtons.Controls.Add(this.btnPTTBoth);
			this.pnlPTTButtons.Controls.Add(this.btnPTTUHF);
			this.pnlPTTButtons.Location = new System.Drawing.Point(408, 320);
			this.pnlPTTButtons.Name = "pnlPTTButtons";
			this.pnlPTTButtons.Size = new System.Drawing.Size(192, 80);
			this.pnlPTTButtons.TabIndex = 8;
			// 
			// btnPTTVHF
			// 
			this.btnPTTVHF.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnPTTVHF.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(198)))), ((int)(((byte)(48)))), ((int)(((byte)(40)))));
			this.btnPTTVHF.FlashBackground = false;
			this.btnPTTVHF.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnPTTVHF.ForeColor = System.Drawing.Color.White;
			this.btnPTTVHF.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnPTTVHF.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnPTTVHF.Location = new System.Drawing.Point(136, 12);
			this.btnPTTVHF.Name = "btnPTTVHF";
			this.btnPTTVHF.NonLatching = true;
			this.btnPTTVHF.Size = new System.Drawing.Size(56, 68);
			this.btnPTTVHF.TabIndex = 2;
			this.btnPTTVHF.Text = "\r\n PTT\r\n VHF";
			// 
			// btnPTTBoth
			// 
			this.btnPTTBoth.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnPTTBoth.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(198)))), ((int)(((byte)(48)))), ((int)(((byte)(40)))));
			this.btnPTTBoth.FlashBackground = false;
			this.btnPTTBoth.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnPTTBoth.ForeColor = System.Drawing.Color.White;
			this.btnPTTBoth.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnPTTBoth.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnPTTBoth.Location = new System.Drawing.Point(68, 12);
			this.btnPTTBoth.Name = "btnPTTBoth";
			this.btnPTTBoth.NonLatching = true;
			this.btnPTTBoth.Size = new System.Drawing.Size(56, 68);
			this.btnPTTBoth.TabIndex = 1;
			this.btnPTTBoth.Text = "\n PTT\n BOTH";
			// 
			// btnPTTUHF
			// 
			this.btnPTTUHF.AlternateBackgroundColor = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSColor.Green;
			this.btnPTTUHF.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(198)))), ((int)(((byte)(48)))), ((int)(((byte)(40)))));
			this.btnPTTUHF.FlashBackground = false;
			this.btnPTTUHF.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.btnPTTUHF.ForeColor = System.Drawing.Color.White;
			this.btnPTTUHF.Function = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSButtonFunction.NoOp;
			this.btnPTTUHF.IndicatorState = RossCarlson.Vatsim.vERAM.UI.Controls.VSCSIndicatorState.Off;
			this.btnPTTUHF.Location = new System.Drawing.Point(0, 12);
			this.btnPTTUHF.Name = "btnPTTUHF";
			this.btnPTTUHF.NonLatching = true;
			this.btnPTTUHF.Size = new System.Drawing.Size(56, 68);
			this.btnPTTUHF.TabIndex = 0;
			this.btnPTTUHF.Text = "\n PTT\n UHF";
			// 
			// pnlMain
			// 
			this.pnlMain.Anchor = System.Windows.Forms.AnchorStyles.None;
			this.pnlMain.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(92)))), ((int)(((byte)(92)))), ((int)(((byte)(92)))));
			this.pnlMain.Controls.Add(this.pnlGGMisc);
			this.pnlMain.Controls.Add(this.pnlCAQueue);
			this.pnlMain.Controls.Add(this.pnlAG1);
			this.pnlMain.Controls.Add(this.pnlGG2);
			this.pnlMain.Controls.Add(this.pnlPTTButtons);
			this.pnlMain.Controls.Add(this.auxMessageArea);
			this.pnlMain.Controls.Add(this.pnlAG2);
			this.pnlMain.Controls.Add(this.messageArea);
			this.pnlMain.Controls.Add(this.funcMenuMain);
			this.pnlMain.Controls.Add(this.lblRTStatus);
			this.pnlMain.Controls.Add(this.pnlGG1);
			this.pnlMain.Controls.Add(this.lblPage);
			this.pnlMain.Controls.Add(this.lblMenu);
			this.pnlMain.Location = new System.Drawing.Point(1, 21);
			this.pnlMain.Name = "pnlMain";
			this.pnlMain.Size = new System.Drawing.Size(600, 480);
			this.pnlMain.TabIndex = 13;
			// 
			// auxMessageArea
			// 
			this.auxMessageArea.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(82)))), ((int)(((byte)(222)))), ((int)(((byte)(238)))));
			this.auxMessageArea.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.auxMessageArea.ForeColor = System.Drawing.Color.Black;
			this.auxMessageArea.Location = new System.Drawing.Point(272, 332);
			this.auxMessageArea.Name = "auxMessageArea";
			this.auxMessageArea.Size = new System.Drawing.Size(124, 68);
			this.auxMessageArea.TabIndex = 11;
			this.auxMessageArea.Text = "vscsAuxMessageArea1";
			this.auxMessageArea.Click += new System.EventHandler(this.AuxMessageArea_Click);
			// 
			// messageArea
			// 
			this.messageArea.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(180)))), ((int)(((byte)(180)))), ((int)(((byte)(180)))));
			this.messageArea.Error = "";
			this.messageArea.Font = new System.Drawing.Font("Courier New", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.messageArea.ForeColor = System.Drawing.Color.Black;
			this.messageArea.Location = new System.Drawing.Point(0, 332);
			this.messageArea.Name = "messageArea";
			this.messageArea.Size = new System.Drawing.Size(260, 68);
			this.messageArea.TabIndex = 12;
			// 
			// funcMenuMain
			// 
			this.funcMenuMain.Location = new System.Drawing.Point(0, 412);
			this.funcMenuMain.Name = "funcMenuMain";
			this.funcMenuMain.Size = new System.Drawing.Size(600, 68);
			this.funcMenuMain.TabIndex = 5;
			this.funcMenuMain.PageChanged += new System.EventHandler<RossCarlson.Vatsim.vERAM.UI.Controls.VSCSPageChangedEventArgs>(this.FuncMenuMain_PageChanged);
			this.funcMenuMain.MenuChanged += new System.EventHandler<RossCarlson.Vatsim.vERAM.UI.Controls.VSCSMenuChangedEventArgs>(this.FuncMenuMain_MenuChanged);
			this.funcMenuMain.ReleaseButtonPressed += new System.EventHandler(this.FuncMenuMain_ReleaseButtonPressed);
			this.funcMenuMain.AutoVoiceRouteButtonPressed += new System.EventHandler(this.FuncMenuMain_AutoVoiceRouteButtonPressed);
			this.funcMenuMain.NonOverrideOutputButtonPressed += new System.EventHandler(this.FuncMenuMain_NonOverrideOutputButtonPressed);
			this.funcMenuMain.OverrideOutputButtonPressed += new System.EventHandler(this.FuncMenuMain_OverrideOutputButtonPressed);
			// 
			// lblRTStatus
			// 
			this.lblRTStatus.BackColor = System.Drawing.Color.White;
			this.lblRTStatus.BracketThickness = 2;
			this.lblRTStatus.BracketWidth = 18;
			this.lblRTStatus.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.lblRTStatus.ForeColor = System.Drawing.Color.Black;
			this.lblRTStatus.Location = new System.Drawing.Point(272, 320);
			this.lblRTStatus.Name = "lblRTStatus";
			this.lblRTStatus.Size = new System.Drawing.Size(124, 12);
			this.lblRTStatus.TabIndex = 9;
			this.lblRTStatus.Text = "    R/T OFF";
			// 
			// lblPage
			// 
			this.lblPage.BackColor = System.Drawing.Color.White;
			this.lblPage.BracketThickness = 0;
			this.lblPage.BracketWidth = 0;
			this.lblPage.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.lblPage.ForeColor = System.Drawing.Color.Black;
			this.lblPage.Location = new System.Drawing.Point(0, 400);
			this.lblPage.Name = "lblPage";
			this.lblPage.Size = new System.Drawing.Size(56, 12);
			this.lblPage.TabIndex = 15;
			this.lblPage.Text = " A/G 1";
			// 
			// lblMenu
			// 
			this.lblMenu.BackColor = System.Drawing.Color.White;
			this.lblMenu.BracketThickness = 0;
			this.lblMenu.BracketWidth = 0;
			this.lblMenu.Font = new System.Drawing.Font("VSCS", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.lblMenu.ForeColor = System.Drawing.Color.Black;
			this.lblMenu.Location = new System.Drawing.Point(68, 400);
			this.lblMenu.Name = "lblMenu";
			this.lblMenu.Size = new System.Drawing.Size(56, 12);
			this.lblMenu.TabIndex = 16;
			this.lblMenu.Text = " PRI";
			// 
			// VSCSForm
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(32)))), ((int)(((byte)(32)))), ((int)(((byte)(32)))));
			this.ClientSize = new System.Drawing.Size(602, 502);
			this.ControlBox = false;
			this.Controls.Add(this.pnlMain);
			this.ForeColor = System.Drawing.Color.White;
			this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.None;
			this.MaximizeBox = false;
			this.MinimizeBox = false;
			this.Name = "VSCSForm";
			this.ShowIcon = false;
			this.ShowInTaskbar = false;
			this.StartPosition = System.Windows.Forms.FormStartPosition.Manual;
			this.Text = "VSCS";
			this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.VSCSForm_FormClosing);
			this.FormClosed += new System.Windows.Forms.FormClosedEventHandler(this.VSCSForm_FormClosed);
			this.Load += new System.EventHandler(this.VSCSForm_Load);
			this.Shown += new System.EventHandler(this.VSCSForm_Shown);
			this.Move += new System.EventHandler(this.VSCSForm_Move);
			this.pnlCAQueue.ResumeLayout(false);
			this.pnlGGMisc.ResumeLayout(false);
			this.pnlPTTButtons.ResumeLayout(false);
			this.pnlMain.ResumeLayout(false);
			this.ResumeLayout(false);

		}

		#endregion

		private System.Windows.Forms.Panel pnlAG1;
		private System.Windows.Forms.Panel pnlAG2;
		private System.Windows.Forms.Panel pnlGG1;
		private System.Windows.Forms.Panel pnlGG2;
		private Controls.VSCSFunctionMenu funcMenuMain;
		private System.Windows.Forms.Panel pnlCAQueue;
		private System.Windows.Forms.Panel pnlGGMisc;
		private System.Windows.Forms.Panel pnlPTTButtons;
		private Controls.VSCSLabel lblRTStatus;
		private Controls.VSCSAuxMessageArea auxMessageArea;
		private Controls.VSCSMessageArea messageArea;
		private Controls.VSCSButton btnPTTUHF;
		private Controls.VSCSButton btnPTTVHF;
		private Controls.VSCSButton btnPTTBoth;
		private Controls.VSCSButton btnCallAnswer;
		private Controls.VSCSButton btnHold;
		private Controls.VSCSVoiceMonitor voiceMonitor;
		private System.Windows.Forms.Panel pnlMain;
		private Controls.VSCSLabel lblMenu;
		private Controls.VSCSLabel lblPage;
		private Controls.VSCSDAButton btnCAQueue4;
		private Controls.VSCSDAButton btnCAQueue3;
		private Controls.VSCSDAButton btnCAQueue2;
		private Controls.VSCSDAButton btnCAQueue1;






	}
}